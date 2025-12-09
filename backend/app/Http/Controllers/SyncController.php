<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function syncClients()
    {
        try {
            // Fetch data from external SQL Server
            $externalClients = \Illuminate\Support\Facades\DB::connection('external_bijou')
                ->table('F_COMPTET')
                ->where('CT_Type', 0)
                ->select([
                    'CT_Num',
                    'CT_Intitule',
                    'CT_Contact',
                    'CT_Adresse',
                    'CT_Ville',
                    'CT_Telephone',
                    'CT_Telecopie',
                    'CT_EMail'
                ])
                ->get();

            $count = 0;

            foreach ($externalClients as $client) {
                \App\Models\Client::updateOrCreate(
                    ['ct_num' => $client->CT_Num],
                    [
                        'ct_intitule' => $client->CT_Intitule,
                        'ct_contact' => $client->CT_Contact,
                        'ct_adresse' => $client->CT_Adresse,
                        'ct_ville' => $client->CT_Ville,
                        'ct_telephone' => $client->CT_Telephone,
                        'ct_email' => $client->CT_EMail,
                    ]
                );
                $count++;
            }

            return response()->json([
                'message' => 'Clients synchronized successfully.',
                'count' => $count,
                'timestamp' => now()->toDateTimeString()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Sync failed: ' . $e->getMessage(),
                'error' => true
            ], 500);
        }
    }

    public function syncBrands()
    {
        try {
            // Fetch brands from SQL Server F_CATALOGUE where CL_NoParent = 0
            $externalBrands = \Illuminate\Support\Facades\DB::connection('external_bijou')
                ->table('F_CATALOGUE')
                ->where('CL_NoParent', 0)
                ->select(['CL_No as brand_id', 'CL_Intitule as name'])
                ->get();

            $count = 0;
            foreach ($externalBrands as $brand) {
                \App\Models\Brand::updateOrCreate(
                    ['brand_id' => $brand->brand_id],
                    [
                        'name' => $brand->name,
                        'description' => null,
                        'cover' => null
                    ]
                );
                $count++;
            }

            return response()->json([
                'message' => 'Brands synchronized successfully.',
                'count' => $count,
                'timestamp' => now()->toDateTimeString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Brands sync failed: ' . $e->getMessage(),
                'error' => true
            ], 500);
        }
    }

    public function syncCatalogs()
    {
        try {
            // Fetch all catalog entries from F_CATALOGUE
            $externalCatalogs = \Illuminate\Support\Facades\DB::connection('external_bijou')
                ->table('F_CATALOGUE')
                ->select([
                    'CL_No',
                    'CL_Intitule',
                    'CL_NoParent',
                    'CL_Niveau'
                ])
                ->get();

            $count = 0;
            foreach ($externalCatalogs as $catalog) {
                \App\Models\Catalogue::updateOrCreate(
                    ['CL_No' => $catalog->CL_No],
                    [
                        'CL_intitule' => $catalog->CL_Intitule,
                        'CL_NoParent' => $catalog->CL_NoParent,
                        'CL_Niveau' => $catalog->CL_Niveau
                    ]
                );
                $count++;
            }

            return response()->json([
                'message' => 'Catalogs synchronized successfully.',
                'count' => $count,
                'timestamp' => now()->toDateTimeString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Catalogs sync failed: ' . $e->getMessage(),
                'error' => true
            ], 500);
        }
    }

    public function syncProducts()
    {
        try {
            // Get or create default brand
            $defaultBrand = \App\Models\Brand::first();
            if (!$defaultBrand) {
                // Create a default brand if none exists
                $defaultBrand = \App\Models\Brand::create([
                    'brand_id' => 1,
                    'name' => 'Default Brand',
                    'description' => null,
                    'cover' => null
                ]);
            }
            $defaultBrandId = $defaultBrand->brand_id;

            // Fetch products from F_ARTICLE with stock info
            $externalProducts = \Illuminate\Support\Facades\DB::connection('external_bijou')
                ->select("
                    SELECT 
                        F_ARTICLE.ar_ref, 
                        F_ARTICLE.AR_Design,
                        F_ARTICLE.FA_CodeFamille,
                        F_ARTICLE.AR_CodeBarre,
                        CL_No1, 
                        CL_No2, 
                        AR_PrixTTC,
                        CASE 
                            WHEN AR_PrixTTC = 0 THEN AR_PrixVen * 1.2 
                            ELSE AR_PrixVen 
                        END AS PRIX,
                        SUM(F_ARTSTOCK.AS_QteSto) AS AS_QteSto 
                    FROM F_ARTICLE
                    LEFT JOIN F_ARTSTOCK 
                        ON F_ARTSTOCK.AR_Ref = F_ARTICLE.AR_Ref
                    WHERE CL_No1 != 0  
                        AND AR_PrixVen > 0
                    GROUP BY 
                        F_ARTICLE.ar_ref, 
                        F_ARTICLE.AR_Design,
                        F_ARTICLE.FA_CodeFamille,
                        F_ARTICLE.AR_CodeBarre,
                        CL_No1, 
                        CL_No2,
                        AR_PrixVen,
                        AR_PrixTTC
                    ORDER BY F_ARTICLE.ar_ref
                ");

            $count = 0;
            $updated = 0;
            $created = 0;

            foreach ($externalProducts as $product) {
                $existing = \App\Models\GlassesProduct::find($product->ar_ref);
                
                if ($existing) {
                    // Update if price or stock changed
                    $needsUpdate = false;
                    $updates = [];
                    
                    if ($existing->qte_stock != $product->AS_QteSto) {
                        $updates['qte_stock'] = $product->AS_QteSto;
                        $needsUpdate = true;
                    }
                    
                    if (abs($existing->price - $product->PRIX) > 0.01) {
                        $updates['price'] = round($product->PRIX, 2);
                        $needsUpdate = true;
                    }
                    
                    // Update code_bar if missing
                    if ((!$existing->code_bar || trim($existing->code_bar) === '') && 
                        $product->AR_CodeBarre && trim($product->AR_CodeBarre) !== '') {
                        $updates['code_bar'] = $product->AR_CodeBarre;
                        $needsUpdate = true;
                    }
                    
                    if ($needsUpdate) {
                        $existing->update($updates);
                        $updated++;
                    }
                } else {
                    // Create new product
                    \App\Models\GlassesProduct::create([
                        'reference' => $product->ar_ref,
                        'code_bar' => $product->AR_CodeBarre,
                        'title' => $product->AR_Design,
                        'description' => 'z',
                        'price' => round($product->PRIX, 2),
                        'qte_stock' => $product->AS_QteSto,
                        'FA_CodeFamille' => $product->FA_CodeFamille,
                        'CL_No1' => $product->CL_No1,
                        'CL_No2' => $product->CL_No2,
                        'CL_No3' => null,
                        'CL_No4' => null,
                        'cover' => 'defaultcover',
                        'brand' => null,
                        'brand_id' => $defaultBrandId,
                        'Ventes' => 0
                    ]);
                    $created++;
                }
                $count++;
            }

            return response()->json([
                'message' => 'Products synchronized successfully.',
                'count' => $count,
                'created' => $created,
                'updated' => $updated,
                'timestamp' => now()->toDateTimeString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Products sync failed: ' . $e->getMessage(),
                'error' => true
            ], 500);
        }
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $primaryKey = 'ct_num';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
}

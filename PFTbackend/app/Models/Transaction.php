<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    // Specify the primary key if it's not "id"
    protected $primaryKey = 'transaction_id'; // <-- replace with your actual PK column name

    // If your primary key is not auto-incrementing
    public $incrementing = true; // or false if it's not

    // If your primary key is not an integer
    protected $keyType = 'int'; // or 'string'

    protected $fillable = [
        'user_id',
        'type',
        'category',
        'amount',
        'transaction_date',
        'description',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SavingsGoal extends Model
{
    use HasFactory;

    protected $primaryKey = 'goal_id';

    protected $fillable = [
        'user_id',
        'title',
        'target_amount',
        'deadline',
        'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

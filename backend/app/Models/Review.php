<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 
 *
 * @property int $review_id
 * @property int $product_id
 * @property int $user_id
 * @property int $rating
 * @property string|null $title
 * @property string|null $comment
 * @property int $is_approved
 * @property string|null $ip_address
 * @property string $review_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Product $product
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review whereComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review whereIsApproved($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review whereReviewDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review whereReviewId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Review whereUserId($value)
 * @mixin \Eloquent
 */

    class Review extends Model
    {
        use HasFactory;

        protected $primaryKey = 'review_id';

        protected $fillable = [
            'product_id',
            'user_id',
            'rating',
            'title',
            'comment',
            'is_approved',
            'ip_address',
            'review_date',
        ];

        protected $casts = [
            'is_approved' => 'boolean',
            'review_date' => 'datetime',
        ];

        // العلاقة مع المنتج الذي تمت مراجعته
        public function product()
        {
            return $this->belongsTo(Product::class, 'product_id');
        }

        // العلاقة مع المستخدم الذي كتب المراجعة
        public function user()
        {
            return $this->belongsTo(User::class, 'user_id');
        }
    }
    
<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'branch_id',
        'role_id',
        'name',
        'email',
        'password',
        'profile_image',
        'phone_number',
        'address',
        'city',
        'state',
        'zip',
        'country',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];
    // 👇 Add this line 
    protected $appends = ['role_name', 'country_name', 'state_name', 'city_name'];
    
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
    
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    // 👇 Add this accessor method for passing the role name
    public function getRoleNameAttribute()
    {
        return $this->role ? $this->role->name : null;
    }
    
    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    // 👇 Add this accessor method for passing the country name
    public function getCountryNameAttribute()
    {
        return $this->country ? $this->country->name : null;
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    // 👇 Add this accessor method for passing the state name
    public function getStateNameAttribute()
    {
        return $this->state ? $this->state->name : null;
    }
    
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    // 👇 Add this accessor method for passing the city name
    public function getCityNameAttribute()
    {
        return $this->city ? $this->city->name : null;
    }
    
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}

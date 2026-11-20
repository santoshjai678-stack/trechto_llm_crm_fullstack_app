<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public string $token)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = env('REACT_APP_URL', 'http://localhost:3000');

        $resetUrl = "{$frontendUrl}/reset-password?token={$this->token}&email={$notifiable->email}";
        $user = User::where('email', $notifiable->email)->first();
        $name = $user ? $user->name : 'User';
        return (new MailMessage)
            ->subject('Reset Password')
            ->view('emails.auth.reset-password', [
                'resetUrl' => $resetUrl,
                'name' => $name,
            ]);
            // ->line('Click the button below to reset your password.')
            // ->action('Reset Password', $resetUrl)
            // ->line('If you did not request this, ignore this email.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}

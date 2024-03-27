from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import user_list
from .models import Match, Tournament

@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    user_list.objects.update_or_create(user=user, defaults={'status': 'online'})

@receiver(user_logged_out)
def user_logged_out_handler(sender, request, user, **kwargs):
    user_list.objects.update_or_create(user=user, defaults={'status': 'offline'})

@receiver(post_save, sender=Match)
def create_match_between_winners(sender, instance, **kwargs):
    if instance.status == 'end_game':
        tournament = Tournament.objects.filter(
            player01=instance.player1,
            player02=instance.player2,
            status='end_game'
        ).first()

        if tournament and tournament.match_set.filter(status='end_game').count() == 2:
            winner1 = tournament.match_set.first().player_winner
            winner2 = tournament.match_set.last().player_winner

            new_match = Match.objects.create(player1=winner1, player2=winner2)
            tournament.status = 'waiting'
            tournament.save()

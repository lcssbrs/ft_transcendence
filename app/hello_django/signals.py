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
def create_final_match(sender, instance, **kwargs):
        tournament = instance.tournament
        if tournament:
            match1 = tournament.match_set.filter(order=1).first()
            match2 = tournament.match_set.filter(order=2).first()
            if match1 and match2:
                if match1.status in ['end_game', 'cancel'] and match2.status in ['end_game', 'cancel']:
                    winner1 = match1.player_winner
                    winner2 = match2.player_winner
                    if winner1 and winner2:
                        final_match = Match.objects.create(tournament=tournament, order=3, player1=winner1, player2=winner2)
                        final_match.save()


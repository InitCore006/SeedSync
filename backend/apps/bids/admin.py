"""Bids Admin"""
from django.contrib import admin
from .models import Bid, BidAcceptance

admin.site.register(Bid)
admin.site.register(BidAcceptance)

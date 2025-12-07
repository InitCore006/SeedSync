"""
Serializers for Market Insights API
"""
from rest_framework import serializers


class MarketSummarySerializer(serializers.Serializer):
    """Serializer for market summary data"""
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    crop_type = serializers.CharField()
    demand_quintals = serializers.FloatField()
    supply_quintals = serializers.FloatField()
    avg_price = serializers.FloatField()


class FPOInsightsSerializer(serializers.Serializer):
    """Serializer for FPO-specific insights"""
    buyer_demand_by_crop = serializers.ListField()
    state_crop_demand = serializers.ListField()


class RetailerInsightsSerializer(serializers.Serializer):
    """Serializer for Retailer-specific insights"""
    retailer_price_trends = serializers.ListField()
    retailer_monthly_demand = serializers.ListField()


class ProcessorInsightsSerializer(serializers.Serializer):
    """Serializer for Processor-specific insights"""
    procurement_by_state = serializers.ListField()
    completion_rates = serializers.ListField()


class FarmerInsightsSerializer(serializers.Serializer):
    """Serializer for Farmer-specific insights"""
    market_shortages = serializers.ListField()
    best_price_crops = serializers.ListField()


class DateRangeSerializer(serializers.Serializer):
    """Serializer for date range"""
    start = serializers.DateTimeField(allow_null=True)
    end = serializers.DateTimeField(allow_null=True)


class MarketInsightsResponseSerializer(serializers.Serializer):
    """
    Main response serializer for all market insights
    Returns comprehensive data for the requested role
    """
    data_available = serializers.BooleanField()
    total_orders = serializers.IntegerField()
    date_range = DateRangeSerializer()
    market_summary = MarketSummarySerializer(many=True)
    farmer_insights = FarmerInsightsSerializer()
    role_insights = serializers.JSONField(allow_null=True)

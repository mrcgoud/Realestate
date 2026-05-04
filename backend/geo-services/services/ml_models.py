import numpy as np
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class PricePredictor:
    """ML model for property price prediction"""
    
    def __init__(self):
        self.feature_weights = {
            "bedrooms": 50000,
            "bathrooms": 30000,
            "areaSquareFeet": 150,  # $150 per sqft base
            "yearBuilt": -500,  # Older = less (appraisement factor)
            "latitude": 1000,  # Location premium
            "longitude": 800,
        }
        self.property_type_multiplier = {
            "apartment": 0.8,
            "house": 1.0,
            "commercial": 1.5,
            "land": 0.5,
            "office": 1.3,
            "villa": 1.2,
        }
    
    def predict(
        self,
        features: Dict,
        comparable_properties: List[Dict],
        **kwargs
    ) -> Tuple[float, float]:
        """
        Predict price using features and comparable properties.
        Returns (predicted_price, confidence_score)
        """
        try:
            # Base prediction from features
            base_price = self._calculate_base_price(features)
            
            # Adjust with comparable properties
            if comparable_properties:
                adjusted_price = self._adjust_with_comparables(
                    base_price, features, comparable_properties
                )
            else:
                adjusted_price = base_price
            
            # Calculate confidence
            confidence = self._calculate_confidence(
                comparable_properties, adjusted_price
            )
            
            return adjusted_price, confidence
            
        except Exception as e:
            logger.error(f"Price prediction error: {e}")
            # Return base estimate with low confidence
            return self._calculate_base_price(features), 0.3
    
    def _calculate_base_price(self, features: Dict) -> float:
        """Calculate base price from property features"""
        price = 0
        
        # Linear combination of features
        price += features.get("bedrooms", 0) * self.feature_weights["bedrooms"]
        price += features.get("bathrooms", 0) * self.feature_weights["bathrooms"]
        price += features.get("areaSquareFeet", 0) * self.feature_weights["areaSquareFeet"]
        
        # Year factor (recent properties worth more)
        years_old = max(0, 2024 - features.get("yearBuilt", 2000))
        price -= years_old * self.feature_weights["yearBuilt"]
        
        # Location premium (latitude/longitude position)
        # Normalized to city center effects
        lat_factor = abs(features.get("latitude", 37) - 37) * self.feature_weights["latitude"]
        lon_factor = abs(features.get("longitude", -122) + 122) * self.feature_weights["longitude"]
        price += lat_factor + lon_factor
        
        # Property type multiplier
        prop_type = features.get("propertyType", "apartment")
        multiplier = self.property_type_multiplier.get(prop_type, 1.0)
        price *= multiplier
        
        # Ensure price is positive
        return max(price, 50000)
    
    def _adjust_with_comparables(
        self,
        base_price: float,
        features: Dict,
        comparables: List[Dict]
    ) -> float:
        """Adjust prediction using comparable properties"""
        if not comparables:
            return base_price
        
        # Calculate price per sqft from comparables
        prices_per_sqft = []
        for comp in comparables:
            if comp.get("areaSquareFeet", 0) > 0:
                ppsf = comp["price"] / comp["areaSquareFeet"]
                prices_per_sqft.append(ppsf)
        
        if prices_per_sqft:
            # Use median price per sqft
            median_ppsf = np.median(prices_per_sqft)
            area = features.get("areaSquareFeet", 1000)
            comparable_based_price = median_ppsf * area
            
            # Weight: 60% comparables, 40% model
            adjusted_price = (comparable_based_price * 0.6 + base_price * 0.4)
            return adjusted_price
        
        return base_price
    
    def _calculate_confidence(
        self,
        comparables: List[Dict],
        predicted_price: float
    ) -> float:
        """Calculate confidence score (0-1) for prediction"""
        if not comparables or len(comparables) < 2:
            return 0.3
        
        # More comparables = higher confidence
        confidence = min(len(comparables) / 10, 1.0) * 0.7
        
        # Check price variance in comparables
        prices = [c["price"] for c in comparables]
        if prices:
            mean_price = np.mean(prices)
            std_dev = np.std(prices)
            
            if std_dev > 0:
                cv = std_dev / mean_price  # Coefficient of variation
                # Low variance = high confidence
                variance_confidence = 1 - min(cv, 1.0)
                confidence += variance_confidence * 0.3
        
        return min(confidence, 1.0)


class LocalityScorer:
    """Score localities for investment potential"""
    
    def __init__(self):
        self.weights = {
            "appreciation": 0.4,
            "amenities": 0.3,
            "growth": 0.2,
            "stability": 0.1,
        }
    
    def score(self, metrics: Dict) -> float:
        """Calculate overall locality score"""
        score = (
            metrics.get("appreciation_score", 50) * self.weights["appreciation"] +
            metrics.get("amenity_score", 50) * self.weights["amenities"] +
            metrics.get("growth_score", 50) * self.weights["growth"] +
            metrics.get("stability_score", 50) * self.weights["stability"]
        )
        return min(max(score, 0), 100)


# Initialize singletons
price_predictor = PricePredictor()
locality_scorer = LocalityScorer()

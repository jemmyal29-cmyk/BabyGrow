# BabyGrow - AI/ML Model Specifications

## 🤖 AI System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AI/ML PIPELINE                            │
│                                                              │
│  ┌──────────────┐      ┌───────────────┐                   │
│  │  Input Data  │──────▶│ Preprocessing │                   │
│  │              │      │               │                   │
│  │ • Age        │      │ • Normalization│                   │
│  │ • Gender     │      │ • Z-scores    │                   │
│  │ • Weight     │      │ • Feature Eng.│                   │
│  │ • Height     │      └───────┬───────┘                   │
│  │ • History    │              │                           │
│  └──────────────┘              │                           │
│                                 ▼                           │
│                     ┌───────────────────┐                   │
│                     │  Stunting Model   │                   │
│                     │  (Classification) │                   │
│                     └─────────┬─────────┘                   │
│                               │                             │
│                               ▼                             │
│                     ┌───────────────────┐                   │
│                     │  Risk Assessment  │                   │
│                     │  • Risk Level     │                   │
│                     │  • Confidence     │                   │
│                     │  • Factors        │                   │
│                     └─────────┬─────────┘                   │
│                               │                             │
│                               ▼                             │
│                     ┌───────────────────┐                   │
│                     │ Recommendation    │                   │
│                     │ Engine            │                   │
│                     │ • Meal Plans      │                   │
│                     │ • Interventions   │                   │
│                     └───────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Dataset Requirements

### Training Data Structure

```python
# Required columns for training dataset
DATASET_SCHEMA = {
    'child_id': 'string',
    'age_months': 'float',        # Age in months (0-60)
    'gender': 'categorical',      # 'male' or 'female'
    'weight_kg': 'float',         # Current weight
    'height_cm': 'float',         # Current height/length
    'head_circumference_cm': 'float',
    
    # Calculated features
    'weight_for_age_zscore': 'float',
    'height_for_age_zscore': 'float',
    'weight_for_height_zscore': 'float',
    'bmi': 'float',
    'bmi_zscore': 'float',
    
    # Historical features (3-6 months)
    'weight_change_3m': 'float',   # kg change in 3 months
    'height_change_3m': 'float',   # cm change in 3 months
    'growth_velocity': 'float',    # cm/month
    'weight_velocity': 'float',    # kg/month
    
    # Socioeconomic (if available)
    'birth_weight_kg': 'float',
    'birth_length_cm': 'float',
    'maternal_height_cm': 'float',
    'paternal_height_cm': 'float',
    
    # Target variable
    'stunting_status': 'categorical'  # 'normal', 'at_risk', 'stunted', 'severely_stunted'
}
```

### Data Sources

1. **WHO Child Growth Standards**
   - Reference data for z-score calculation
   - https://www.who.int/tools/child-growth-standards

2. **National Health Surveys (Indonesia)**
   - Riset Kesehatan Dasar (Riskesdas)
   - Data from Ministry of Health

3. **Clinical Data**
   - Hospital/Puskesmas records
   - Posyandu measurement data

4. **Synthetic Data**
   - Generated based on WHO distributions
   - For augmentation and rare cases

## 🧠 Model Architecture

### 1. Stunting Classification Model

```python
# app/models/ml_models/stunting_classifier.py

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
from typing import Dict, List, Tuple

class StuntingClassifier:
    """
    Deep Neural Network for Stunting Risk Classification
    
    Architecture: Multi-layer Perceptron (MLP)
    Input: 12 features
    Output: 4 classes (normal, at_risk, stunted, severely_stunted)
    """
    
    def __init__(self, model_path: str = None):
        self.input_dim = 12
        self.num_classes = 4
        self.class_names = ['normal', 'at_risk', 'stunted', 'severely_stunted']
        
        if model_path:
            self.model = self.load_model(model_path)
        else:
            self.model = self.build_model()
    
    def build_model(self) -> keras.Model:
        """
        Build the neural network architecture
        """
        model = keras.Sequential([
            # Input layer
            layers.Input(shape=(self.input_dim,), name='input'),
            
            # Hidden layer 1
            layers.Dense(128, activation='relu', name='dense_1'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            # Hidden layer 2
            layers.Dense(64, activation='relu', name='dense_2'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            # Hidden layer 3
            layers.Dense(32, activation='relu', name='dense_3'),
            layers.BatchNormalization(),
            layers.Dropout(0.2),
            
            # Hidden layer 4
            layers.Dense(16, activation='relu', name='dense_4'),
            
            # Output layer
            layers.Dense(self.num_classes, activation='softmax', name='output')
        ])
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=[
                'accuracy',
                keras.metrics.AUC(name='auc'),
                keras.metrics.Precision(name='precision'),
                keras.metrics.Recall(name='recall')
            ]
        )
        
        return model
    
    def prepare_features(self, data: Dict) -> np.ndarray:
        """
        Prepare input features from raw data
        
        Args:
            data: Dictionary containing measurement data
            
        Returns:
            Numpy array of shape (1, 12)
        """
        features = np.array([[
            data['age_months'],
            1 if data['gender'] == 'male' else 0,  # Gender encoding
            data['weight_kg'],
            data['height_cm'],
            data.get('head_circumference_cm', 0),
            data['weight_for_age_zscore'],
            data['height_for_age_zscore'],
            data['weight_for_height_zscore'],
            data['bmi'],
            data.get('growth_velocity', 0),  # cm/month
            data.get('weight_velocity', 0),  # kg/month
            data.get('birth_weight_kg', 3.3)  # Default birth weight
        ]], dtype=np.float32)
        
        return features
    
    def predict(self, features: np.ndarray) -> Dict:
        """
        Make prediction
        
        Returns:
            Dictionary with prediction results
        """
        # Get predictions
        predictions = self.model.predict(features, verbose=0)
        
        # Get predicted class
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        
        # Get all probabilities
        probabilities = {
            class_name: float(prob)
            for class_name, prob in zip(self.class_names, predictions[0])
        }
        
        # Analyze contributing factors
        factors = self._analyze_factors(features[0])
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            self.class_names[class_idx],
            features[0]
        )
        
        return {
            'risk_level': self.class_names[class_idx],
            'confidence': confidence,
            'probabilities': probabilities,
            'contributing_factors': factors,
            'recommendations': recommendations,
            'timestamp': np.datetime64('now').astype(str)
        }
    
    def _analyze_factors(self, features: np.ndarray) -> List[str]:
        """
        Analyze which factors contribute to stunting risk
        """
        factors = []
        
        # Feature indices
        age_idx = 0
        height_zscore_idx = 6
        weight_zscore_idx = 5
        wfh_zscore_idx = 7
        growth_velocity_idx = 9
        weight_velocity_idx = 10
        
        # Height-for-age analysis
        if features[height_zscore_idx] < -3:
            factors.append('Tinggi badan jauh di bawah standar WHO (Z-score < -3)')
        elif features[height_zscore_idx] < -2:
            factors.append('Tinggi badan di bawah standar WHO (Z-score < -2)')
        elif features[height_zscore_idx] < -1:
            factors.append('Tinggi badan sedikit di bawah rata-rata')
        
        # Weight-for-age analysis
        if features[weight_zscore_idx] < -2:
            factors.append('Berat badan kurang dari standar WHO')
        
        # Weight-for-height analysis
        if features[wfh_zscore_idx] < -2:
            factors.append('Berat badan tidak proporsional dengan tinggi')
        elif features[wfh_zscore_idx] > 2:
            factors.append('Berat badan berlebih untuk tinggi badan')
        
        # Growth velocity analysis
        if features[growth_velocity_idx] < 0.5:
            factors.append('Kecepatan pertumbuhan tinggi badan sangat lambat')
        elif features[growth_velocity_idx] < 1.0:
            factors.append('Kecepatan pertumbuhan tinggi badan lambat')
        
        # Weight velocity analysis
        if features[weight_velocity_idx] < 0.1:
            factors.append('Penambahan berat badan sangat lambat')
        
        # Age-specific considerations
        if features[age_idx] < 6:
            factors.append('Periode kritis pertumbuhan (0-6 bulan)')
        elif features[age_idx] < 24:
            factors.append('Periode penting untuk pencegahan stunting (< 2 tahun)')
        
        if not factors:
            factors.append('Pertumbuhan dalam batas normal')
        
        return factors
    
    def _generate_recommendations(
        self,
        risk_level: str,
        features: np.ndarray
    ) -> List[str]:
        """
        Generate actionable recommendations based on risk level
        """
        recommendations = []
        
        if risk_level == 'normal':
            recommendations.extend([
                'Pertahankan pola makan bergizi seimbang',
                'Lanjutkan pemantauan rutin setiap bulan',
                'Pastikan asupan protein, vitamin, dan mineral tercukupi',
                'Dorong aktivitas fisik sesuai usia'
            ])
        
        elif risk_level == 'at_risk':
            recommendations.extend([
                'Tingkatkan asupan protein berkualitas tinggi',
                'Konsumsi makanan kaya zat besi dan zinc',
                'Ikuti program Makanan Bergizi Gratis (MBG)',
                'Pantau pertumbuhan setiap 2 minggu',
                'Konsultasi dengan ahli gizi di Puskesmas'
            ])
        
        elif risk_level == 'stunted':
            recommendations.extend([
                'SEGERA konsultasi dengan dokter atau ahli gizi',
                'Ikuti program intervensi gizi intensif',
                'Tingkatkan frekuensi makan (5-6x sehari)',
                'Fokus pada makanan padat gizi',
                'Pantau pertumbuhan setiap minggu',
                'Pertimbangkan suplementasi vitamin/mineral',
                'Evaluasi kondisi kesehatan (penyakit infeksi, parasit)'
            ])
        
        elif risk_level == 'severely_stunted':
            recommendations.extend([
                '⚠️ TINDAKAN SEGERA DIPERLUKAN',
                'Konsultasi medis segera ke Puskesmas/Rumah Sakit',
                'Program rehabilitasi gizi intensif',
                'Pemeriksaan kesehatan komprehensif',
                'Suplementasi gizi di bawah supervisi medis',
                'Pantau pertumbuhan 2x seminggu',
                'Rujuk ke spesialis anak jika perlu'
            ])
        
        # Height-specific recommendations
        height_zscore = features[6]
        if height_zscore < -2:
            recommendations.extend([
                'Fokus pada makanan tinggi protein dan kalsium',
                'Pastikan tidur cukup (10-12 jam/hari)',
                'Aktivitas fisik yang mendukung pertumbuhan tulang'
            ])
        
        return recommendations
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        epochs: int = 100,
        batch_size: int = 32
    ) -> keras.callbacks.History:
        """
        Train the model
        """
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-6
            ),
            keras.callbacks.ModelCheckpoint(
                'models/stunting_model_best.h5',
                monitor='val_accuracy',
                save_best_only=True
            )
        ]
        
        # Train
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def save_model(self, path: str):
        """Save model to disk"""
        self.model.save(path)
        print(f'Model saved to {path}')
    
    def load_model(self, path: str) -> keras.Model:
        """Load model from disk"""
        return keras.models.load_model(path)
    
    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict:
        """
        Evaluate model performance
        """
        results = self.model.evaluate(X_test, y_test, verbose=0)
        
        metrics = {
            'loss': results[0],
            'accuracy': results[1],
            'auc': results[2],
            'precision': results[3],
            'recall': results[4]
        }
        
        # Confusion matrix
        predictions = self.model.predict(X_test, verbose=0)
        y_pred = np.argmax(predictions, axis=1)
        y_true = np.argmax(y_test, axis=1)
        
        from sklearn.metrics import confusion_matrix, classification_report
        
        cm = confusion_matrix(y_true, y_pred)
        report = classification_report(
            y_true, y_pred,
            target_names=self.class_names,
            output_dict=True
        )
        
        metrics['confusion_matrix'] = cm.tolist()
        metrics['classification_report'] = report
        
        return metrics
```

### 2. WHO Z-Score Calculator

```python
# app/services/who_standards.py

import pandas as pd
import numpy as np
from typing import Dict, Tuple
from scipy.interpolate import interp1d

class WHOStandards:
    """
    WHO Child Growth Standards Calculator
    Uses LMS method (Lambda-Mu-Sigma) for z-score calculation
    """
    
    def __init__(self, standards_path: str = 'data/who_standards/'):
        """
        Load WHO standards data
        """
        self.standards_path = standards_path
        
        # Load LMS tables
        self.wfa_boys = pd.read_csv(f'{standards_path}wfa_boys_0_5.csv')
        self.wfa_girls = pd.read_csv(f'{standards_path}wfa_girls_0_5.csv')
        self.lhfa_boys = pd.read_csv(f'{standards_path}lhfa_boys_0_5.csv')
        self.lhfa_girls = pd.read_csv(f'{standards_path}lhfa_girls_0_5.csv')
        self.wfl_boys = pd.read_csv(f'{standards_path}wfl_boys.csv')
        self.wfl_girls = pd.read_csv(f'{standards_path}wfl_girls.csv')
    
    def calculate_zscore(
        self,
        measurement: float,
        L: float,
        M: float,
        S: float
    ) -> float:
        """
        Calculate z-score using LMS method
        
        Formula: Z = [(X/M)^L - 1] / (L * S)
        Where:
        - X = measured value
        - L = Box-Cox power
        - M = median
        - S = coefficient of variation
        """
        if L == 0:
            # Special case for L=0
            zscore = np.log(measurement / M) / S
        else:
            zscore = ((measurement / M) ** L - 1) / (L * S)
        
        return round(zscore, 2)
    
    def get_lms_params(
        self,
        age_months: float,
        gender: str,
        indicator: str,
        length_or_height: float = None
    ) -> Tuple[float, float, float]:
        """
        Get LMS parameters for given age/gender/indicator
        
        Args:
            age_months: Age in months
            gender: 'male' or 'female'
            indicator: 'wfa', 'lhfa', or 'wfl'
            length_or_height: Required for wfl indicator
        
        Returns:
            Tuple of (L, M, S)
        """
        # Select appropriate table
        if indicator == 'wfa':
            table = self.wfa_boys if gender == 'male' else self.wfa_girls
            key = age_months
        elif indicator == 'lhfa':
            table = self.lhfa_boys if gender == 'male' else self.lhfa_girls
            key = age_months
        elif indicator == 'wfl':
            table = self.wfl_boys if gender == 'male' else self.wfl_girls
            key = length_or_height
        else:
            raise ValueError(f'Unknown indicator: {indicator}')
        
        # Find closest match or interpolate
        if key in table['age'].values or key in table.get('length', []):
            row = table[table['age' if indicator != 'wfl' else 'length'] == key].iloc[0]
        else:
            # Interpolate
            col_name = 'age' if indicator != 'wfl' else 'length'
            L = np.interp(key, table[col_name], table['L'])
            M = np.interp(key, table[col_name], table['M'])
            S = np.interp(key, table[col_name], table['S'])
            return (L, M, S)
        
        return (row['L'], row['M'], row['S'])
    
    def calculate_all_zscores(
        self,
        age_months: float,
        gender: str,
        weight_kg: float,
        height_cm: float
    ) -> Dict[str, float]:
        """
        Calculate all relevant z-scores
        
        Returns:
            Dictionary with z-scores for WFA, HFA, WFH, and BMI
        """
        # Weight-for-age
        L, M, S = self.get_lms_params(age_months, gender, 'wfa')
        wfa_zscore = self.calculate_zscore(weight_kg, L, M, S)
        
        # Height-for-age (or Length-for-age)
        L, M, S = self.get_lms_params(age_months, gender, 'lhfa')
        hfa_zscore = self.calculate_zscore(height_cm, L, M, S)
        
        # Weight-for-height/length
        L, M, S = self.get_lms_params(
            age_months, gender, 'wfl', length_or_height=height_cm
        )
        wfh_zscore = self.calculate_zscore(weight_kg, L, M, S)
        
        # BMI
        bmi = weight_kg / ((height_cm / 100) ** 2)
        
        return {
            'weight_for_age_zscore': wfa_zscore,
            'height_for_age_zscore': hfa_zscore,
            'weight_for_height_zscore': wfh_zscore,
            'bmi': round(bmi, 2),
            'bmi_category': self.classify_bmi(wfh_zscore)
        }
    
    def classify_stunting(self, hfa_zscore: float) -> str:
        """
        Classify stunting status based on height-for-age z-score
        
        WHO Definition:
        - Normal: >= -2 SD
        - Stunted: < -2 SD
        - Severely Stunted: < -3 SD
        """
        if hfa_zscore >= -1:
            return 'normal'
        elif hfa_zscore >= -2:
            return 'at_risk'
        elif hfa_zscore >= -3:
            return 'stunted'
        else:
            return 'severely_stunted'
    
    def classify_bmi(self, wfh_zscore: float) -> str:
        """
        Classify BMI/nutritional status
        """
        if wfh_zscore < -3:
            return 'severely_wasted'
        elif wfh_zscore < -2:
            return 'wasted'
        elif wfh_zscore >= -2 and wfh_zscore <= 1:
            return 'normal'
        elif wfh_zscore > 1 and wfh_zscore <= 2:
            return 'possible_overweight'
        elif wfh_zscore > 2 and wfh_zscore <= 3:
            return 'overweight'
        else:
            return 'obese'
```

### 3. Recommendation Engine

```python
# app/services/recommendation_service.py

from typing import Dict, List
import pandas as pd

class RecommendationEngine:
    """
    Generate personalized nutrition recommendations
    """
    
    def __init__(self, recipes_db_path: str):
        self.recipes = pd.read_csv(recipes_db_path)
    
    def generate_meal_plan(
        self,
        age_months: int,
        risk_level: str,
        weight_kg: float,
        height_cm: float,
        preferences: Dict = None
    ) -> Dict:
        """
        Generate personalized meal plan
        
        Returns:
            Dictionary with recommended recipes and meal schedule
        """
        # Calculate nutritional needs
        nutritional_needs = self.calculate_nutritional_needs(
            age_months, weight_kg, height_cm, risk_level
        )
        
        # Filter appropriate recipes
        suitable_recipes = self.filter_recipes(
            age_months, risk_level, preferences
        )
        
        # Create meal plan
        meal_plan = self.create_meal_plan(
            suitable_recipes, nutritional_needs, risk_level
        )
        
        return {
            'nutritional_needs': nutritional_needs,
            'meal_plan': meal_plan,
            'recipes': suitable_recipes[:10],  # Top 10 recommendations
            'tips': self.generate_tips(age_months, risk_level)
        }
    
    def calculate_nutritional_needs(
        self,
        age_months: int,
        weight_kg: float,
        height_cm: float,
        risk_level: str
    ) -> Dict:
        """
        Calculate daily nutritional requirements
        Based on Indonesian RDA (Angka Kecukupan Gizi)
        """
        # Base calorie needs (simplified)
        base_calories = 100 * weight_kg  # kcal/day
        
        # Adjust for risk level
        multiplier = {
            'normal': 1.0,
            'at_risk': 1.1,
            'stunted': 1.2,
            'severely_stunted': 1.3
        }
        
        calories = base_calories * multiplier.get(risk_level, 1.0)
        
        # Macronutrient distribution
        protein_g = weight_kg * 1.5  # 1.5g per kg
        fat_g = calories * 0.30 / 9  # 30% from fat
        carbs_g = (calories - (protein_g * 4 + fat_g * 9)) / 4
        
        return {
            'calories_kcal': round(calories),
            'protein_g': round(protein_g, 1),
            'fat_g': round(fat_g, 1),
            'carbohydrates_g': round(carbs_g, 1),
            'iron_mg': 7 if age_months < 12 else 10,
            'zinc_mg': 3 if age_months < 12 else 5,
            'vitamin_a_mcg': 400 if age_months < 12 else 450,
            'calcium_mg': 270 if age_months < 12 else 500
        }
    
    def filter_recipes(
        self,
        age_months: int,
        risk_level: str,
        preferences: Dict = None
    ) -> List[Dict]:
        """
        Filter recipes based on criteria
        """
        # Age filter
        suitable = self.recipes[
            (self.recipes['age_min_months'] <= age_months) &
            (self.recipes['age_max_months'] >= age_months)
        ]
        
        # Risk level filter (prioritize high-protein for at-risk)
        if risk_level in ['at_risk', 'stunted', 'severely_stunted']:
            suitable = suitable.sort_values('protein_g', ascending=False)
        
        # Preferences filter (allergies, dietary restrictions)
        if preferences:
            if 'allergies' in preferences:
                for allergen in preferences['allergies']:
                    suitable = suitable[
                        ~suitable['ingredients'].str.contains(allergen, case=False)
                    ]
        
        return suitable.to_dict('records')
    
    def create_meal_plan(
        self,
        recipes: List[Dict],
        nutritional_needs: Dict,
        risk_level: str
    ) -> Dict:
        """
        Create weekly meal plan
        """
        meals_per_day = 5 if age_months >= 12 else 4
        
        meal_plan = {
            'breakfast': [],
            'morning_snack': [],
            'lunch': [],
            'afternoon_snack': [],
            'dinner': []
        }
        
        # Simple algorithm: rotate through top recipes
        # In production, use optimization to meet nutritional targets
        
        for i, recipe in enumerate(recipes[:35]):  # 5 meals x 7 days
            meal_type = list(meal_plan.keys())[i % meals_per_day]
            meal_plan[meal_type].append({
                'recipe_id': recipe['id'],
                'name': recipe['title'],
                'calories': recipe['calories_kcal'],
                'protein': recipe['protein_g']
            })
        
        return meal_plan
    
    def generate_tips(self, age_months: int, risk_level: str) -> List[str]:
        """
        Generate nutrition tips
        """
        tips = []
        
        if age_months < 6:
            tips.append('ASI eksklusif adalah nutrisi terbaik untuk bayi < 6 bulan')
        else:
            tips.append('Lanjutkan ASI sambil memberikan MPASI bergizi')
        
        if risk_level != 'normal':
            tips.extend([
                'Berikan makanan tinggi protein (telur, ikan, ayam, kacang-kacangan)',
                'Tambahkan minyak/lemak sehat untuk meningkatkan kalori',
                'Berikan makanan kaya zat besi (hati, daging merah, sayuran hijau)'
            ])
        
        return tips
```

## 📈 Model Training Pipeline

```python
# scripts/train_model.py

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

def prepare_data(data_path: str):
    """
    Load and prepare training data
    """
    df = pd.read_csv(data_path)
    
    # Feature engineering
    df['bmi'] = df['weight_kg'] / ((df['height_cm'] / 100) ** 2)
    
    # Calculate z-scores using WHO standards
    who = WHOStandards()
    
    for idx, row in df.iterrows():
        zscores = who.calculate_all_zscores(
            row['age_months'],
            row['gender'],
            row['weight_kg'],
            row['height_cm']
        )
        df.loc[idx, 'weight_for_age_zscore'] = zscores['weight_for_age_zscore']
        df.loc[idx, 'height_for_age_zscore'] = zscores['height_for_age_zscore']
        df.loc[idx, 'weight_for_height_zscore'] = zscores['weight_for_height_zscore']
    
    # Features
    feature_columns = [
        'age_months', 'gender_encoded', 'weight_kg', 'height_cm',
        'head_circumference_cm', 'weight_for_age_zscore',
        'height_for_age_zscore', 'weight_for_height_zscore',
        'bmi', 'growth_velocity', 'weight_velocity', 'birth_weight_kg'
    ]
    
    X = df[feature_columns].values
    
    # Target (one-hot encoded)
    y = pd.get_dummies(df['stunting_status']).values
    
    return X, y, df

def train_model():
    """
    Complete training pipeline
    """
    # Load data
    X, y, df = prepare_data('data/training_data.csv')
    
    # Split data
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    
    # Normalize features
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_val = scaler.transform(X_val)
    X_test = scaler.transform(X_test)
    
    # Save scaler
    joblib.dump(scaler, 'models/scaler.pkl')
    
    # Initialize model
    model = StuntingClassifier()
    
    # Train
    history = model.train(
        X_train, y_train,
        X_val, y_val,
        epochs=100,
        batch_size=32
    )
    
    # Evaluate
    metrics = model.evaluate(X_test, y_test)
    print('Test Metrics:', metrics)
    
    # Save model
    model.save_model('models/stunting_model_final.h5')
    
    return model, metrics

if __name__ == '__main__':
    model, metrics = train_model()
```

## 🚀 Model Deployment

### FastAPI Service

```python
# app/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List
import numpy as np

from models.ml_models.stunting_classifier import StuntingClassifier
from services.who_standards import WHOStandards
from services.recommendation_service import RecommendationEngine

app = FastAPI(title="BabyGrow AI Service", version="1.0.0")

# Load models
stunting_model = StuntingClassifier(model_path='models/stunting_model_final.h5')
who_standards = WHOStandards(standards_path='data/who_standards/')
recommendation_engine = RecommendationEngine(recipes_db_path='data/recipes.csv')

class MeasurementInput(BaseModel):
    age_months: float
    gender: str
    weight_kg: float
    height_cm: float
    head_circumference_cm: float = None
    previous_measurements: List[Dict] = None

class PredictionResponse(BaseModel):
    risk_level: str
    confidence: float
    probabilities: Dict[str, float]
    zscores: Dict[str, float]
    contributing_factors: List[str]
    recommendations: List[str]

@app.post("/api/v1/predict", response_model=PredictionResponse)
async def predict_stunting(data: MeasurementInput):
    """
    Predict stunting risk
    """
    try:
        # Calculate WHO z-scores
        zscores = who_standards.calculate_all_zscores(
            data.age_months,
            data.gender,
            data.weight_kg,
            data.height_cm
        )
        
        # Prepare input for model
        input_data = {
            'age_months': data.age_months,
            'gender': data.gender,
            'weight_kg': data.weight_kg,
            'height_cm': data.height_cm,
            'head_circumference_cm': data.head_circumference_cm or 0,
            **zscores,
            'growth_velocity': 0,  # Calculate from previous_measurements
            'weight_velocity': 0,
            'birth_weight_kg': 3.3  # Default
        }
        
        # Make prediction
        features = stunting_model.prepare_features(input_data)
        result = stunting_model.predict(features)
        
        return {
            **result,
            'zscores': zscores
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/recommendations")
async def get_recommendations(
    age_months: int,
    risk_level: str,
    weight_kg: float,
    height_cm: float
):
    """
    Get nutrition recommendations
    """
    try:
        recommendations = recommendation_engine.generate_meal_plan(
            age_months, risk_level, weight_kg, height_cm
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

---

**Expected Performance**:
- Accuracy: > 85%
- Precision: > 80%
- Recall: > 80%
- F1-Score: > 80%

**Model Updates**: Retrain quarterly with new data from field usage.

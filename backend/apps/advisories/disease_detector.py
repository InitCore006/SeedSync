import torch

import torch.nn as nn
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification
import logging

logger = logging.getLogger(__name__)


# ====================
# SOYBEAN MODEL ARCH
# ====================
class BaselineModel(nn.Module):
    """Same architecture as your Kaggle training code."""
    def __init__(self, num_classes):
        super(BaselineModel, self).__init__()
        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc = nn.Linear(16 * 112 * 112, num_classes)

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = x.view(-1, 16 * 112 * 112)
        x = self.fc(x)
        return x


# ========================
# DETECTOR CLASS
# ========================
class MultiCropDiseaseDetector:
    """
    Loads HF Models for Groundnut + Sunflower
    Loads LOCAL CNN Model for Soybean
    """

    def __init__(self):
        logger.info("🔄 Initializing MultiCropDiseaseDetector...")

        self.model_repo = {
            "groundnut": "karannnn309/groundnut-vit-model",
            "sunflower": "karannnn309/sunflower-vit-model"
        }

        from pathlib import Path
        
        BASE_DIR = Path(__file__).resolve().parent  # <== points to advisories/
        
        self.local_soybean_model_path = BASE_DIR / "disease_model" / "soyabean_disease_model.pth"
        self.soybean_labels = ["Healthy", "Yellow Mosaic Disease1"]
        
        self.models ={}
        self.processors ={}

        # Load HF models
        self.load_huggingface_models()

        # Load local soybean
        self.load_local_soybean_model()

        # Disease solution DB
        self.SOLUTIONS = self.load_solution_database()

    # ==========================================================
    # 1️⃣ LOAD HF MODELS
    # ==========================================================
    def load_huggingface_models(self):
        for crop, repo in self.model_repo.items():
            try:
                logger.info(f"📥 Loading HuggingFace model for {crop} from {repo}")

                processor = AutoImageProcessor.from_pretrained(repo)
                model = AutoModelForImageClassification.from_pretrained(repo)
                model.eval()

                self.models[crop] = model
                self.processors[crop] = processor

                logger.info(f"✅ HF model loaded for {crop}")

            except Exception as e:
                logger.error(f"❌ HF model failed for {crop}: {e}")

    # ==========================================================
    # 2️⃣ LOAD LOCAL SOYBEAN MODEL
    # ==========================================================
    def load_local_soybean_model(self):
        try:
            logger.info("📥 Loading local Soybean model...")

            num_classes = len(self.soybean_labels)

            model = BaselineModel(num_classes=num_classes)

            state_dict = torch.load(self.local_soybean_model_path, map_location="cpu")

            model.load_state_dict(state_dict)
            model.eval()

            self.models["soybean"] = model
            self.processors["soybean"] = None  # NOT using HF processor

            logger.info("✅ Local Soybean CNN Model Loaded Successfully")

        except Exception as e:
            logger.error(f"❌ Failed to load local soybean model: {e}")


    # ------------------------------------------------------------------------------------
    # SOLUTION DATABASE
    # ------------------------------------------------------------------------------------
    def load_solution_database(self):
        """Hard-coded disease solution database."""

        return {
            "groundnut": {
                "Leaf Spot": {
                    "disease_name": "Leaf Spot",
                    "severity": "Medium",
                    "description": "Fungal disease causing brown circular lesions on leaves.",
                    "symptoms": ["Brown spots", "Yellowing", "Premature leaf drop"],
                    "prevention": [
                        "Use resistant varieties",
                        "Maintain field sanitation"
                    ],
                    "treatment": [
                        "Apply Mancozeb or Chlorothalonil",
                        "Remove infected leaves"
                    ],
                    "chemicals": ["Mancozeb 2.5g/L", "Chlorothalonil 2g/L"],
                    "recommended_dose": "2–2.5 g per litre of water",
                    "cost_estimate": "₹400–₹600 per acre",
                    "expert_contact": "Nearest Krishi Sevak"
                },
                "Rust": {
                    "disease_name": "Rust",
                    "severity": "High",
                    "description": "Orange/brown pustules on leaf underside.",
                    "symptoms": ["Orange pustules", "Drying leaves"],
                    "prevention": ["Avoid overhead irrigation"],
                    "treatment": ["Apply Propiconazole"],
                    "chemicals": ["Propiconazole 1ml/L"],
                    "recommended_dose": "300 ml per acre",
                    "cost_estimate": "₹500–₹700",
                    "expert_contact": "Agriculture officer"
                },
                "Healthy": {
                    "disease_name": "Healthy Plant",
                    "severity": "None",
                    "description": "Plant shows no signs of any disease.",
                    "symptoms": [],
                    "prevention": ["Continue normal care"],
                    "treatment": ["No treatment required"],
                    "chemicals": [],
                    "recommended_dose": "N/A",
                    "cost_estimate": "0",
                    "expert_contact": "N/A"
                }
            },

            "soybean": {
                "Healthy": {
                    "disease_name": "Healthy",
                    "severity": "None",
                    "description": "Plant is healthy.",
                    "symptoms": [],
                    "prevention": ["Maintain irrigation"],
                    "treatment": ["None required"],
                    "chemicals": [],
                    "recommended_dose": "",
                    "cost_estimate": "",
                    "expert_contact": ""
                }
            },

            "sunflower": {
                "Healthy": {
                    "disease_name": "Healthy",
                    "severity": "None",
                    "description": "No disease detected",
                    "symptoms": [],
                    "prevention": ["Maintain field hygiene"],
                    "treatment": ["None"],
                    "chemicals": [],
                    "recommended_dose": "",
                    "cost_estimate": "",
                    "expert_contact": ""
                }
            }
        }

    # ------------------------------------------------------------------------------------
    # PREDICTION
    # ------------------------------------------------------------------------------------
    def predict(self, image_file, crop_type):
        try:
            model = self.models.get(crop_type)
            processor = self.processors.get(crop_type)
    
            if not model:
                return {"error": f"No model loaded for crop: {crop_type}"}
    
            # --------------------------------------------------
            # 1️⃣ LOCAL SOYBEAN MODEL (NO HF PROCESSOR)
            # --------------------------------------------------
            if crop_type == "soybean":
                image = Image.open(image_file).convert("RGB")
    
                # Resize (your CNN trained on 224x224)
                image = image.resize((224, 224))
    
                import torchvision.transforms as transforms
                transform = transforms.Compose([
                    transforms.ToTensor(),
                ])
    
                img_tensor = transform(image).unsqueeze(0)   # shape: (1,3,224,224)
    
                with torch.no_grad():
                    logits = model(img_tensor)
                    pred_idx = logits.argmax(-1).item()
                    confidence = torch.softmax(logits, dim=-1)[0][pred_idx].item() * 100
    
                # Map to your label list
                disease = self.soybean_labels[pred_idx]
    
                # Get solution
                solution = self.get_solution("soybean", disease)
    
                return {
                    "crop_type": "soybean",
                    "disease": disease,
                    "confidence_percentage": round(confidence, 2),
                    "solution": solution
                }

            # --------------------------------------------------
            # 2️⃣ HUGGINGFACE MODELS (Groundnut, Sunflower)
            # --------------------------------------------------
            image = Image.open(image_file).convert("RGB")
    
            # Use HF processor
            inputs = processor(images=image, return_tensors="pt")
    
            with torch.no_grad():
                outputs = model(**inputs)
    
            logits = outputs.logits
            pred_idx = logits.argmax(-1).item()
            confidence = torch.softmax(logits, dim=-1)[0][pred_idx].item() * 100
    
            disease = model.config.id2label[pred_idx]
            disease = disease.replace("_", " ").title()
    
            solution = self.get_solution(crop_type, disease)
    
            return {
                "crop_type": crop_type,
                "disease": disease,
                "confidence_percentage": round(confidence, 2),
                "solution": solution
            }

        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {"error": str(e)}


    # ------------------------------------------------------------------------------------
    # SOLUTION FETCHER
    # ------------------------------------------------------------------------------------
    def get_solution(self, crop_type, disease):
        crop_db = self.SOLUTIONS.get(crop_type, {})
        return crop_db.get(disease, {
            "disease_name": disease,
            "severity": "Not available",
            "description": "No detailed info available.",
            "symptoms": [],
            "prevention": [],
            "treatment": [],
            "chemicals": [],
            "recommended_dose": "N/A",
            "cost_estimate": "N/A",
            "expert_contact": "N/A"
        })


# Create a global instance to avoid reloading models every request
detector_instance = MultiCropDiseaseDetector()
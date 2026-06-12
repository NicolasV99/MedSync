import unittest
import json
from datetime import datetime

# Mock background worker function for payload validation
def validate_whatsapp_payload(payload):
    required_fields = ["recipient_phone", "template_id", "template_variables", "timestamp"]
    
    # 1. Check for missing fields
    for field in required_fields:
        if field not in payload:
            return {"status": "failed", "error": f"Missing required field: {field}"}
            
    # 2. Validate phone number formatting length basic check
    if not payload["recipient_phone"].startswith("+") or len(payload["recipient_phone"]) < 11:
        return {"status": "failed", "error": "Invalid phone number format format"}
        
    return {"status": "success", "error": None}

class TestWhatsAppBackgroundWorker(unittest.TestCase):

    def setUp(self):
        """Set up standard mock data for testing."""
        self.valid_payload = {
            "recipient_phone": "+2348012345678",
            "template_id": "medsync_appointment_reminder",
            "template_variables": {
                "patient_name": "John Doe",
                "appointment_time": "10:00 AM"
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    def test_valid_payload_dispatch(self):
        """Test that a correctly structured payload passes validation."""
        result = validate_whatsapp_payload(self.valid_payload)
        self.assertEqual(result["status"], "success")
        self.assertIsNone(result["error"])

    def test_missing_field_payload(self):
        """Test that missing mandatory fields are caught gracefully."""
        invalid_payload = self.valid_payload.copy()
        del invalid_payload["template_id"]  # Remove a required field
        
        result = validate_whatsapp_payload(invalid_payload)
        self.assertEqual(result["status"], "failed")
        self.assertIn("Missing required field", result["error"])

    def test_invalid_phone_format(self):
        """Test that incorrect phone formats trigger validation errors."""
        invalid_payload = self.valid_payload.copy()
        invalid_payload["recipient_phone"] = "08012345678"  # Missing country code '+'
        
        result = validate_whatsapp_payload(invalid_payload)
        self.assertEqual(result["status"], "failed")
        self.assertEqual(result["error"], "Invalid phone number format format")

if __name__ == "__main__":
    unittest.main()
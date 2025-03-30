curl -k http://127.0.0.1:5000/v1/internal/model/load \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gemma3",
    "args": {
      "load_in_4bit": true,
      "n_gpu_layers": 12
    }
  }'
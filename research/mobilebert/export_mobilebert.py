import os
import sys
import shutil
import torch
import onnx

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

RESEARCH_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(RESEARCH_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from research.mobilebert.train_mobilebert import MobileBertBottleneckEncoder

MODELS_DIR = os.path.join(RESEARCH_DIR, 'models')

def export_to_onnx():
    print("==================================================")
    print("Q-NETRA RESEARCH: EXPORTING MOBILEBERT TO ONNX")
    print("==================================================")
    
    weights_path = os.path.join(MODELS_DIR, 'mobilebert_context.pt')
    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"Checkpoint not found at {weights_path}. Run train_mobilebert.py first.")
        
    checkpoint = torch.load(weights_path, map_location='cpu', weights_only=False)
    model = MobileBertBottleneckEncoder(vocab_size=30522)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    
    dummy_input_ids = torch.randint(0, 30522, (1, 64), dtype=torch.long)
    dummy_attention_mask = torch.ones((1, 64), dtype=torch.long)
    
    onnx_out_path = os.path.join(MODELS_DIR, 'mobilebert_context_fp32.onnx')
    
    torch.onnx.export(
        model,
        (dummy_input_ids, dummy_attention_mask),
        onnx_out_path,
        export_params=True,
        opset_version=18,
        do_constant_folding=True,
        input_names=['input_ids', 'attention_mask'],
        output_names=['logits'],
        dynamic_axes={
            'input_ids': {0: 'batch_size', 1: 'sequence_length'},
            'attention_mask': {0: 'batch_size', 1: 'sequence_length'},
            'logits': {0: 'batch_size'}
        },
        dynamo=False
    )
    
    # Verify ONNX model
    onnx_model = onnx.load(onnx_out_path)
    onnx.checker.check_model(onnx_model)
    
    file_size_mb = os.path.getsize(onnx_out_path) / (1024 * 1024)
    print(f"[+] ONNX Export Successful: {onnx_out_path}")
    print(f"[*] FP32 Model Size: {file_size_mb:.2f} MB")
    
    return onnx_out_path

if __name__ == '__main__':
    export_to_onnx()

# Local Model Folder Scheme

This describes Todd's local Windows model library for Persona Crucis and
GobboNet. GGUF files remain on the local machine and are not committed here.

## Machine and services

- Windows 11
- NVIDIA RTX 3060, 8 GB VRAM
- 16 GB system RAM
- GobboNet 1.7.9-go-nogit
- llama-server embedding endpoint: port 11436
- llama-server main generation endpoint: port 11437

Suggested local root: D:\AI\models\

```text
D:\AI\models\
├── 00-embed\
│   └── nomic-embed-text-v1.5.Q8_0.gguf
├── 01-daily\
│   ├── Qwen_Qwen3-8B-Q6_K.gguf
│   ├── Qwen2.5-7B-Q4_K_M.gguf
│   ├── Qwen2.5-3B-Q4_K_M.gguf
│   └── Llama-3.1-8B-Q4_K_M.gguf
├── 02-rp\
│   ├── L3-8B-Stheno-v3.2-Q4_K_M.gguf
│   ├── Mistral-Nemo-Instruct-2407-Q4_K_M.gguf
│   ├── MythoMax-L2-13B-Q3_K_M.gguf
│   └── Nemo-12B-Q3_K_M.gguf
├── 03-wacky\
│   ├── Goliath-120B-distilled-student-builds\
│   ├── Toppy-M\
│   ├── Chronos-Hermes\
│   ├── Airoboros\
│   ├── Magnum-v4-12B-Q3\
│   ├── Euryale-7B\
│   ├── Behemoth-Synatra-7.2B-Q4\
│   ├── Dolphin-2.9.2-Qwen2-7B-Q4\
│   └── Lexi-Uncensored-Q4\
└── 99-archive\
```

The 03-wacky names are filing labels, not guaranteed exact upstream filenames.
Some refer to model families with multiple parameter counts and quantizations.

## Folder responsibilities

| Folder | Role | Contents |
|---|---|---|
| 00-embed | Retrieval infrastructure | Embedding GGUF only |
| 01-daily | General chat and extraction | Qwen and Llama daily models |
| 02-rp | Character performance | Stheno, Nemo, MythoMax |
| 03-wacky | Experiments | JanitorAI/Pygmalion-style and high-variance models |
| 99-archive | Cold storage | Old, duplicate, retired, benchmark files |

## Embedding server: fixed settings

For nomic-embed-text-v1.5.Q8_0.gguf, preserve these settings exactly:

```text
--batch-size 384 --ubatch-size 384 --threads 2 --n-gpu-layers 0
```

The tested lower batch configuration fails around token 186 of 214. A batch
size of 2048 OOMs after approximately 24 seconds. Do not optimize these values
downward or upward without a fresh controlled test.

Use port 11436 for the embedding server. Windows restart-loop pattern:

```bat
:loop
llama-server.exe [established embedding arguments, including fixed settings]
goto loop
```

The loop restarts after process exit; it does not repair invalid arguments or
prevent repeated crashes.

## Main model server

Use port 11437 for the active chat model. Keep one main model active at a time.
On an 8 GB RTX 3060, context length and GPU layer count determine whether a
model fits. Leave room for KV cache, compute buffers, Windows, and other GPU
processes.

Mistral Nemo 12B Q4_K_M: use context 8192. Context 16384 is a known crash risk
on this RTX 3060 8 GB configuration.

## Character onboarding workflow

Qwen is the accountant; Stheno is the actress.

1. Select Qwen for a new character's first approximately 15 messages.
2. Inspect soul.dump() and wait until verified facts number at least 3.
3. Switch the main-model dropdown to L3-8B-Stheno-v3.2-Q4_K_M.
4. Continue the character conversation with Stheno.

This lets the more conservative extraction model establish a small grounded
continuity base before handing performance to the RP model. Never treat an
unverified or invented statement as a stored fact.

## Inventory maintenance

- Keep exact downloaded filenames in models.txt.
- Record the quant suffix and actual file size from Windows Explorer or dir.
  Do not infer exact size from a family name.
- Record llama.cpp's reported model buffer / GPU offload and actual peak VRAM
  after loading at the intended context length.
- When replacing a model, move the old GGUF to 99-archive rather than silently
  overwriting a known-working file.
- Do not commit GGUF model weights, launcher secrets, or personal chat logs.

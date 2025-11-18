# File Placement Guide - Migration from Old Project

This document shows where files from the old VOXVERTEX project should be placed in the new monorepo structure.

## 📁 Final Structure

```
voxvertex-monorepo/
├── apps/
│   ├── frontend/
│   │   ├── .env.local              ⏳ Create manually (NEXT_PUBLIC_API_URL)
│   │   ├── package.json              ✅ Updated
│   │   ├── next.config.ts            ⏳ Copy from old project
│   │   ├── tsconfig.json             ⏳ Copy from old project
│   │   ├── eslint.config.mjs         ⏳ Copy from old project
│   │   ├── postcss.config.mjs        ⏳ Copy from old project
│   │   ├── next-env.d.ts             ⏳ Copy from old project (or regenerate)
│   │   └── ...
│   │
│   └── backend/
│       ├── .env.local                ⏳ Create manually (copy from env-local-backend.txt)
│       ├── env.local.dev             ⏳ Copy from old project
│       ├── env.local.prod            ⏳ Copy from old project
│       └── ...
│
├── scripts/
│   ├── switch-to-local.bat            ✅ Created
│   └── switch-to-production.bat       ✅ Created
│
├── docs/
│   ├── README-INTEGRATION.md          ⏳ Copy from old project
│   ├── DYNAMIC_EVENT_TYPES_IMPLEMENTATION.md  ⏳ Copy
│   ├── EVENT_TYPES_FLOW_DIAGRAM.md    ⏳ Copy
│   ├── IMPLEMENTATION_SUMMARY.md      ⏳ Copy
│   ├── speaker_search_api_routes.txt  ⏳ Copy
│   └── structure.txt                  ⏳ Copy
│
└── README.md                          ⏳ Merge or replace
```


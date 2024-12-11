/ (Root)
├── /presets                    # Public preset marketplace
│   ├── ?view=explore          # Default public view
│   └── /[id]                  # Individual preset view
│
├── /packs                      # Public pack marketplace
│   ├── ?view=explore          # Default public view
│   └── /[id]                  # Individual pack view
│
├── /requests                   # Public requests marketplace
│   ├── ?view=explore          # Default public view
│   └── /[id]                  # Individual request view
│
└── /dashboard                  # User dashboard (authenticated only)
    ├── ?category=presets      # Dashboard presets management
    │   ├── ?view=uploaded     # User's uploaded presets
    │   └── ?view=downloaded   # User's downloaded presets
    │
    ├── ?category=packs        # Dashboard packs management
    │   ├── ?view=uploaded     # User's uploaded packs
    │   └── ?view=downloaded   # User's downloaded packs
    │
    └── ?category=requests     # Dashboard requests management
        ├── ?view=requested    # User's requested presets
        ├── ?view=assisted     # User's assisted requests
        └── ?view=public       # Public requests view
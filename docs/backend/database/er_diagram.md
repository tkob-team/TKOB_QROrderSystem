```Mermaid
erDiagram
    %% --- IDENTITY & AUTH ---
    USER {
        string id PK
        string email UK
        string password_hash
        string full_name
        enum role
        enum status
        string tenant_id FK
        datetime created_at
        datetime updated_at
    }

    USER_SESSION {
        string id PK
        string user_id FK
        string refresh_token_hash
        string device_info
        datetime last_used_at
        datetime expires_at
        datetime created_at
    }

    TENANT {
        string id PK
        string name
        string slug UK
        enum status
        json settings
        json opening_hours
        int onboarding_step
        datetime created_at
        datetime updated_at
    }

    TENANT_PAYMENT_CONFIG {
        string id PK
        string stripe_account_id
        string tenant_id FK
    }

    MENU_CATEGORY {
        string id PK
        string tenant_id FK
        string name
        string description
        int display_order
        boolean active
        datetime created_at
        datetime updated_at
    }

    MENU_ITEM {
        string id PK
        string tenant_id FK
        string category_id FK
        string name
        string description
        decimal price
        string image_url
        enum status
        boolean available
        int display_order
        int preparation_time
        boolean chef_recommended
        int popularity
        string primary_photo_id
        json tags
        json allergens
        datetime created_at
        datetime updated_at
        datetime published_at
    }

    MENU_ITEM_PHOTO {
        string id PK
        string menu_item_id FK
        string url
        string filename
        string mime_type
        int size
        int width
        int height
        int display_order
        boolean is_primary
        datetime created_at
        datetime updated_at
    }

    MODIFIER_GROUP {
        string id PK
        string tenant_id FK
        string name
        string description
        enum type
        boolean required
        int min_choices
        int max_choices
        int display_order
        boolean active
        datetime created_at
        datetime updated_at
    }

    MODIFIER_OPTION {
        string id PK
        string group_id FK
        string name
        decimal price_delta
        int display_order
        boolean active
        datetime created_at
        datetime updated_at
    }

    MENU_ITEM_MODIFIER {
        string menu_item_id FK
        string modifier_group_id FK
        int display_order
        datetime created_at
    }

    %% --- TABLE MANAGEMENT ---
    TABLE {
        string id PK
        string tenant_id FK
        string table_number
        int capacity
        string location
        string description
        enum status
        string qr_token UK
        string qr_token_hash
        datetime qr_token_created_at
        datetime qr_invalidated_at
        string current_session_id
        int display_order
        boolean active
        datetime created_at
        datetime updated_at
    }

    TABLE_SESSION {
        string id PK
        string table_id FK
        string tenant_id FK
        datetime scanned_at
        boolean active
        datetime cleared_at
        string cleared_by
        datetime created_at
        datetime updated_at
    }

    %% --- ORDER MANAGEMENT ---
    ORDER {
        string id PK
        string order_number UK
        string tenant_id FK
        string table_id FK
        string session_id FK
        string customer_name
        string customer_notes
        enum status
        decimal subtotal
        decimal tax
        decimal total
        datetime created_at
        datetime updated_at
        datetime served_at
        datetime completed_at
    }

    ORDER_ITEM {
        string id PK
        string order_id FK
        string menu_item_id FK
        string name
        decimal price
        int quantity
        json modifiers
        decimal item_total
        string notes
        boolean prepared
        datetime prepared_at
        datetime created_at
        datetime updated_at
    }

    ORDER_STATUS_HISTORY {
        string id PK
        string order_id FK
        enum status
        string notes
        string changed_by
        datetime created_at
    }

    %% RELATIONS
    TENANT ||--|{ USER : owns
    TENANT ||--|| TENANT_PAYMENT_CONFIG : has
    USER ||--o{ USER_SESSION : has_login

    TENANT ||--|{ MENU_CATEGORY : owns
    TENANT ||--|{ MENU_ITEM : owns
    TENANT ||--|{ MODIFIER_GROUP : owns

    MENU_CATEGORY ||--|{ MENU_ITEM : contains
    MENU_ITEM }|--|{ MODIFIER_GROUP : uses_implicit_n_n
    MODIFIER_GROUP ||--|{ MODIFIER_OPTION : contains
    MENU_ITEM_MODIFIER }|--|| MENU_ITEM : belongs_to_item
    MENU_ITEM_MODIFIER }|--|| MODIFIER_GROUP : belongs_to_group

    MENU_ITEM ||--|{ MENU_ITEM_PHOTO : has_photos

    TENANT ||--|{ TABLE : owns
    TABLE ||--|{ TABLE_SESSION : has_sessions

    TENANT ||--|{ ORDER : processes
    TABLE ||--o{ ORDER : places
    TABLE_SESSION ||--o{ ORDER : session_orders
    ORDER ||--|{ ORDER_ITEM : includes
    ORDER ||--|{ ORDER_STATUS_HISTORY : status_audit
```
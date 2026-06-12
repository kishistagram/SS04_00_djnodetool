/* ---- Track: 音楽そのもののメタデータ ---- */
typedef struct {
    char  *id;            /* string は char* (ヒープ上の文字列) */
    char  *title;
    char  *artist;        /* ? 付き → NULL でもよいポインタ */
    double bpm;           /* number は全部 double。int は存在しない */
    bool   has_bpm;       /* ← ?の翻訳。Cでは「値がない」を別途表現する必要がある */
    char  *key;           /* NULL 許容 */
    double duration_sec;
    bool   has_duration;
    char  *audio_url;     /* NULL 許容 */
    char **tags;          /* string[] → ポインタ配列 */
    size_t tags_len;      /* ← TSでは配列が長さを内蔵。Cでは自分で持つ */
} Track;

/* ---- TrackNode: キャンバス上の配置情報 ---- */
typedef struct {
    char  *id;
    char  *track_id;      /* ★ Track* ではなく ID 文字列。後述 */
    double x, y;
    char  *label;
    char  *color;         /* NULL 許容 */
} TrackNode;

/* ---- TransitionType: union型 → enum ---- */
typedef enum {
    TRANSITION_CUT,
    TRANSITION_FADE,
    TRANSITION_CROSSFADE
} TransitionType;

/* ---- TransitionEdge: 有向エッジ ---- */
typedef struct {
    char          *id;
    char          *from_node_id;   /* これも ID 参照 */
    char          *to_node_id;
    TransitionType transition_type;
    double         fade_duration_sec;  /* ? なし → 必須。cut なら 0 */
    char          *note;               /* NULL 許容 */
} TransitionEdge;

/* ---- Project: 保存/読込の単位。全データの所有者 ---- */
typedef struct {
    char           *id;
    char           *title;
    Track          *tracks;   size_t tracks_len;
    TrackNode      *nodes;    size_t nodes_len;
    TransitionEdge *edges;    size_t edges_len;
    char           *created_at;   /* NULL 許容。ISO 8601 文字列 */
    char           *updated_at;
} Project;
"""
NLP Engine — provides sentiment analysis and text summarization.

HOW IT WORKS (no external libraries needed):

1. SENTIMENT ANALYSIS
   Uses a keyword-based approach with scored word lists.
   Each word in a "positive" or "negative" list has a weight.
   The overall mood is the sum of all word scores.

2. TEXT SUMMARIZATION
   Uses extractive summarization — picks the most important sentences
   from the text based on word frequency scoring.

TO UPGRADE LATER:
- Sentiment: Replace with HuggingFace transformers pipeline("sentiment-analysis")
- Summarization: Replace with pipeline("summarization")
"""
import re
from collections import Counter

# ============================================================
# PART 1: SENTIMENT / MOOD ANALYSIS
# ============================================================

# Words associated with positive feelings (score: +1 to +3)
POSITIVE_WORDS = {
    # Strong positive (+3)
    'amazing': 3, 'wonderful': 3, 'excellent': 3, 'fantastic': 3,
    'incredible': 3, 'brilliant': 3, 'outstanding': 3, 'love': 3,
    'thrilled': 3, 'ecstatic': 3, 'overjoyed': 3, 'blessed': 3,
    # Medium positive (+2)
    'happy': 2, 'great': 2, 'good': 2, 'excited': 2, 'grateful': 2,
    'proud': 2, 'confident': 2, 'motivated': 2, 'inspired': 2,
    'joyful': 2, 'cheerful': 2, 'optimistic': 2, 'peaceful': 2,
    'accomplished': 2, 'successful': 2, 'energized': 2, 'hopeful': 2,
    # Mild positive (+1)
    'fine': 1, 'okay': 1, 'nice': 1, 'pleasant': 1, 'calm': 1,
    'relaxed': 1, 'comfortable': 1, 'content': 1, 'satisfied': 1,
    'better': 1, 'improved': 1, 'helpful': 1, 'enjoyed': 1,
    'interesting': 1, 'productive': 1, 'focused': 1, 'well': 1,
}

# Words associated with negative feelings (score: -1 to -3)
NEGATIVE_WORDS = {
    # Strong negative (-3)
    'terrible': -3, 'awful': -3, 'horrible': -3, 'miserable': -3,
    'devastated': -3, 'hopeless': -3, 'depressed': -3, 'hate': -3,
    'furious': -3, 'disgusted': -3, 'heartbroken': -3, 'worthless': -3,
    # Medium negative (-2)
    'sad': -2, 'angry': -2, 'frustrated': -2, 'anxious': -2,
    'stressed': -2, 'worried': -2, 'upset': -2, 'disappointed': -2,
    'tired': -2, 'exhausted': -2, 'overwhelmed': -2, 'lonely': -2,
    'scared': -2, 'confused': -2, 'annoyed': -2, 'painful': -2,
    'failed': -2, 'struggling': -2, 'difficult': -2, 'hurt': -2,
    # Mild negative (-1)
    'bored': -1, 'meh': -1, 'sluggish': -1, 'uneasy': -1,
    'nervous': -1, 'uncertain': -1, 'restless': -1, 'distracted': -1,
    'bad': -1, 'worse': -1, 'tough': -1, 'hard': -1, 'problem': -1,
}

# Negation words that flip the sentiment of the next word
NEGATION_WORDS = {'not', "n't", 'no', 'never', 'neither', 'nobody', 'nothing',
                  'nowhere', 'hardly', 'barely', 'scarcely', "don't", "doesn't",
                  "didn't", "won't", "wouldn't", "shouldn't", "couldn't", "can't"}


def analyze_mood(text):
    """
    Analyze the mood/sentiment of a text.

    Returns:
    {
        "mood": "positive" | "negative" | "neutral",
        "score": float (-1.0 to 1.0),
        "emoji": "😊" | "😐" | "😔",
        "label": "Happy" | "Neutral" | "Sad" (more specific)
    }
    """
    words = re.findall(r"[a-z']+", text.lower())
    total_score = 0
    word_count = 0

    for i, word in enumerate(words):
        # Check if the previous word is a negation (flips meaning)
        negated = i > 0 and words[i - 1] in NEGATION_WORDS

        if word in POSITIVE_WORDS:
            score = POSITIVE_WORDS[word]
            total_score += -score if negated else score
            word_count += 1
        elif word in NEGATIVE_WORDS:
            score = NEGATIVE_WORDS[word]
            total_score += -score if negated else score
            word_count += 1

    # Normalize to -1.0 to 1.0 range
    if word_count > 0:
        normalized = total_score / (word_count * 3)  # max possible per word is 3
        normalized = max(-1.0, min(1.0, normalized))  # clamp
    else:
        normalized = 0.0

    # Determine mood category and label
    if normalized > 0.3:
        mood = "positive"
        emoji = "😊"
        if normalized > 0.7:
            label = "Very Happy"
        else:
            label = "Happy"
    elif normalized < -0.3:
        mood = "negative"
        emoji = "😔"
        if normalized < -0.7:
            label = "Very Sad"
        else:
            label = "Sad"
    else:
        mood = "neutral"
        emoji = "😐"
        label = "Neutral"

    return {
        "mood": mood,
        "score": round(normalized, 2),
        "emoji": emoji,
        "label": label,
    }


# ============================================================
# PART 2: TEXT SUMMARIZATION (Extractive)
# ============================================================

# Common words to ignore when scoring sentence importance
STOP_WORDS = {
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'to', 'of', 'in', 'for', 'on', 'with',
    'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after',
    'and', 'but', 'or', 'so', 'if', 'then', 'that', 'this', 'it', 'its',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they', 'them',
    'about', 'just', 'very', 'really', 'also', 'not', 'all', 'some', 'more',
    'up', 'out', 'no', 'than', 'too', 'only', 'each', 'which', 'who', 'when',
    'where', 'how', 'what', 'there', 'been', 'here', 'much', 'many',
}


def summarize_text(text, max_sentences=3):
    """
    Generate a summary by extracting the most important sentences.

    How it works:
    1. Split text into sentences
    2. Count word frequencies (ignoring stop words)
    3. Score each sentence by the sum of its word frequencies
    4. Pick the top N highest-scoring sentences
    5. Return them in original order

    This is called "extractive summarization" — it picks existing
    sentences rather than generating new ones.
    """
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]

    if len(sentences) <= max_sentences:
        return text.strip()

    # Count word frequencies across all sentences
    all_words = re.findall(r'[a-z]+', text.lower())
    meaningful_words = [w for w in all_words if w not in STOP_WORDS and len(w) > 2]
    word_freq = Counter(meaningful_words)

    # Score each sentence
    scored = []
    for i, sentence in enumerate(sentences):
        words = re.findall(r'[a-z]+', sentence.lower())
        score = sum(word_freq.get(w, 0) for w in words if w not in STOP_WORDS)
        # Normalize by sentence length to avoid bias toward long sentences
        score = score / (len(words) + 1)
        scored.append((i, score, sentence))

    # Sort by score, pick top N
    scored.sort(key=lambda x: x[1], reverse=True)
    top = scored[:max_sentences]

    # Sort back to original order for readability
    top.sort(key=lambda x: x[0])

    return ' '.join(s[2] for s in top)


# ============================================================
# PART 3: BOOKMARK CATEGORIZATION + SEARCH
# ============================================================

# Category keywords — used to auto-classify bookmarks
CATEGORY_KEYWORDS = {
    'Technology': [
        'programming', 'code', 'software', 'developer', 'api', 'javascript',
        'python', 'react', 'github', 'stackoverflow', 'docker', 'linux',
        'database', 'cloud', 'ai', 'machine learning', 'web', 'app',
        'framework', 'library', 'algorithm', 'data structure', 'devops',
        'frontend', 'backend', 'fullstack', 'tutorial', 'documentation',
    ],
    'Education': [
        'course', 'learn', 'tutorial', 'university', 'study', 'education',
        'lecture', 'textbook', 'research', 'academic', 'school', 'lesson',
        'training', 'certificate', 'degree', 'exam', 'class', 'knowledge',
        'khan academy', 'coursera', 'udemy', 'edx', 'mooc',
    ],
    'Finance': [
        'finance', 'money', 'invest', 'stock', 'crypto', 'bank', 'budget',
        'savings', 'trading', 'market', 'economy', 'tax', 'income',
        'expense', 'wealth', 'portfolio', 'mutual fund', 'insurance',
    ],
    'News': [
        'news', 'article', 'breaking', 'report', 'headline', 'world',
        'politics', 'government', 'election', 'media', 'press', 'bbc',
        'cnn', 'reuters', 'times', 'guardian', 'journalism',
    ],
    'Health': [
        'health', 'fitness', 'exercise', 'workout', 'diet', 'nutrition',
        'mental health', 'meditation', 'yoga', 'sleep', 'wellness',
        'medicine', 'doctor', 'therapy', 'hospital', 'disease',
    ],
    'Entertainment': [
        'movie', 'music', 'game', 'video', 'youtube', 'netflix', 'spotify',
        'podcast', 'anime', 'comic', 'fun', 'entertainment', 'show',
        'series', 'stream', 'play', 'art', 'design', 'creative',
    ],
    'Productivity': [
        'productivity', 'organize', 'planner', 'todo', 'task', 'calendar',
        'notion', 'workflow', 'efficiency', 'time management', 'habit',
        'goal', 'focus', 'schedule', 'tool', 'automation',
    ],
    'Social': [
        'social', 'community', 'forum', 'reddit', 'twitter', 'linkedin',
        'facebook', 'instagram', 'chat', 'messaging', 'network', 'blog',
        'profile', 'connect', 'group', 'discussion',
    ],
}


def categorize_text(title, url, description=''):
    """
    Auto-categorize a bookmark based on its title, URL, and description.
    Returns the best-matching category name.
    """
    # Combine all text for analysis
    combined = f"{title} {url} {description}".lower()

    best_category = 'Other'
    best_score = 0

    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in combined)
        if score > best_score:
            best_score = score
            best_category = category

    return best_category


def search_bookmarks(query, bookmarks):
    """
    Search bookmarks using TF-IDF-like keyword matching.

    How it works:
    1. Split the query into keywords
    2. Score each bookmark by how many query words appear in its title/url/tags
    3. Return bookmarks sorted by relevance (highest score first)

    This is a simplified version of TF-IDF (Term Frequency - Inverse Document Frequency).
    """
    query_words = set(re.findall(r'[a-z]+', query.lower()))
    if not query_words:
        return bookmarks

    scored = []
    for bm in bookmarks:
        # Build searchable text from all bookmark fields
        searchable = f"{bm['title']} {bm['url']} {bm['category']} {' '.join(bm['tags'])} {bm.get('description', '')}".lower()
        searchable_words = set(re.findall(r'[a-z]+', searchable))

        # Count matching words
        matches = query_words & searchable_words
        if matches:
            # Score: number of matches, with bonus for title matches
            title_words = set(re.findall(r'[a-z]+', bm['title'].lower()))
            title_matches = query_words & title_words
            score = len(matches) + (len(title_matches) * 2)  # title matches worth double
            scored.append((score, bm))

    # Sort by score (highest first)
    scored.sort(key=lambda x: x[0], reverse=True)
    return [bm for _, bm in scored]

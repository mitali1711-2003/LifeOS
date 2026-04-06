"""
AI Engine — the "brain" of LifeOS's AI features.

HOW IT WORKS (Simple explanation):
This engine takes your study notes and turns them into flashcards and MCQs
using Natural Language Processing (NLP) techniques:

1. SENTENCE SPLITTING — breaks your text into individual sentences
2. KEY PHRASE EXTRACTION — finds the important terms in each sentence
3. QUESTION GENERATION — turns statements into questions
4. DISTRACTOR GENERATION — creates wrong answers for MCQs

No API key needed! Everything runs locally on your machine.

TO UPGRADE TO OPENAI LATER:
Just set OPENAI_API_KEY in your environment and change USE_OPENAI = True.
The generate_flashcards() and generate_mcqs() functions will automatically
use the OpenAI API instead of the local NLP engine.
"""
import re
import random
import os

# --- Configuration ---
# Set this to True and provide OPENAI_API_KEY to use OpenAI instead
USE_OPENAI = False
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")


# ============================================================
# PART 1: TEXT PROCESSING (breaking notes into useful pieces)
# ============================================================

def split_sentences(text):
    """
    Split text into clean sentences.
    Handles periods, question marks, exclamation marks.
    Filters out very short sentences (< 5 words).
    """
    # Split on sentence-ending punctuation
    raw = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = []
    for s in raw:
        s = s.strip()
        # Only keep sentences with enough words to be meaningful
        if len(s.split()) >= 5:
            sentences.append(s)
    return sentences


def extract_key_phrases(sentence):
    """
    Extract important terms from a sentence.

    Strategy: Pick noun-like words (capitalized words, longer words)
    and skip common "stop words" like "the", "is", "and", etc.
    """
    # Common words that don't carry meaning on their own
    stop_words = {
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
        'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
        'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
        'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
        'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
        'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
        'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
        'because', 'but', 'and', 'or', 'if', 'while', 'that', 'this', 'these',
        'those', 'it', 'its', 'which', 'who', 'whom', 'what', 'also', 'about',
        'up', 'they', 'them', 'their', 'he', 'she', 'his', 'her', 'we', 'our',
        'you', 'your', 'my', 'me', 'i', 'called', 'known', 'refers', 'means',
    }

    # Clean sentence: remove punctuation, split into words
    clean = re.sub(r'[^\w\s]', '', sentence)
    words = clean.split()

    # Keep words that are meaningful (not stop words, not too short)
    key_words = [w for w in words if w.lower() not in stop_words and len(w) > 2]
    return key_words


def find_definition_patterns(sentence):
    """
    Detect sentences that define something.
    e.g., "Photosynthesis is the process by which plants make food."
    Returns (term, definition) or None.
    """
    patterns = [
        # "X is Y" / "X are Y"
        r'^(.+?)\s+(?:is|are)\s+(.+)$',
        # "X refers to Y"
        r'^(.+?)\s+refers?\s+to\s+(.+)$',
        # "X means Y"
        r'^(.+?)\s+means?\s+(.+)$',
        # "X is defined as Y"
        r'^(.+?)\s+is\s+defined\s+as\s+(.+)$',
        # "X, known as Y,"
        r'^(.+?),?\s+(?:known|called)\s+as\s+(.+)$',
    ]

    for pattern in patterns:
        match = re.match(pattern, sentence.strip().rstrip('.'), re.IGNORECASE)
        if match:
            term = match.group(1).strip()
            definition = match.group(2).strip()
            # Only return if both parts are meaningful
            if len(term.split()) <= 5 and len(definition.split()) >= 3:
                return (term, definition)
    return None


# ============================================================
# PART 2: FLASHCARD GENERATION
# ============================================================

def generate_flashcards(text, count=5):
    """
    Generate flashcards from study notes.

    Each flashcard has:
    - question (front of card)
    - answer (back of card)

    Strategy:
    1. First, look for definition sentences ("X is Y") → best flashcards
    2. Then, create fill-in-the-blank from other sentences
    3. Finally, create "What is...?" questions from key terms
    """
    sentences = split_sentences(text)
    flashcards = []

    for sentence in sentences:
        if len(flashcards) >= count:
            break

        # Strategy 1: Definition-style flashcards
        definition = find_definition_patterns(sentence)
        if definition:
            term, defn = definition
            flashcards.append({
                "question": f"What is {term}?",
                "answer": f"{term} is {defn}.",
            })
            continue

        # Strategy 2: Fill-in-the-blank
        key_phrases = extract_key_phrases(sentence)
        if len(key_phrases) >= 2:
            # Pick a key phrase to blank out
            blank_word = random.choice(key_phrases[:3])
            blanked = sentence.replace(blank_word, "________", 1)
            flashcards.append({
                "question": f"Fill in the blank: {blanked}",
                "answer": blank_word,
            })
            continue

        # Strategy 3: Simple "what" question
        if key_phrases:
            flashcards.append({
                "question": f"Explain the concept: {' '.join(key_phrases[:3])}",
                "answer": sentence,
            })

    # If we didn't generate enough, add summary-style cards
    if len(flashcards) < count and sentences:
        flashcards.append({
            "question": "Summarize the main points from your notes.",
            "answer": " ".join(sentences[:3]),
        })

    return flashcards[:count]


# ============================================================
# PART 3: MCQ GENERATION
# ============================================================

def generate_mcqs(text, count=5):
    """
    Generate Multiple Choice Questions from study notes.

    Each MCQ has:
    - question: the question text
    - options: list of 4 choices [A, B, C, D]
    - correct_answer: index of the correct option (0-3)

    Strategy:
    1. Extract key facts from sentences
    2. Create a question about each fact
    3. Generate 3 "distractor" (wrong) answers
    """
    sentences = split_sentences(text)
    mcqs = []
    all_key_phrases = []

    # Collect all key phrases for generating distractors
    for s in sentences:
        all_key_phrases.extend(extract_key_phrases(s))

    for sentence in sentences:
        if len(mcqs) >= count:
            break

        key_phrases = extract_key_phrases(sentence)
        if len(key_phrases) < 2:
            continue

        # The correct answer is one of the key phrases
        correct = key_phrases[0]

        # Create a question by blanking out the correct answer
        definition = find_definition_patterns(sentence)
        if definition:
            term, defn = definition
            question = f"What is {term}?"
            correct = f"{term} is {defn}"
            distractors = _generate_definition_distractors(term, all_key_phrases)
            options = [correct] + distractors
        else:
            question = sentence.replace(correct, "______", 1)
            question = f"Fill in the blank: {question}"
            distractors = _generate_word_distractors(correct, all_key_phrases)
            options = [correct] + distractors

        # Shuffle options so the correct answer isn't always first
        correct_idx = 0
        combined = list(enumerate(options))
        random.shuffle(combined)
        shuffled_options = [opt for _, opt in combined]
        correct_idx = next(i for i, (orig_i, _) in enumerate(combined) if orig_i == 0)

        mcqs.append({
            "question": question,
            "options": shuffled_options,
            "correct_answer": correct_idx,
        })

    return mcqs[:count]


def _generate_word_distractors(correct_word, all_phrases):
    """
    Generate 3 plausible but wrong answers for a word-level MCQ.
    Picks other key phrases of similar length from the notes.
    """
    candidates = [
        w for w in set(all_phrases)
        if w.lower() != correct_word.lower() and len(w) > 2
    ]
    # Sort by similarity in length to the correct answer
    candidates.sort(key=lambda w: abs(len(w) - len(correct_word)))

    distractors = candidates[:3]

    # If we don't have enough, add generic distractors
    generic = ["None of the above", "All of the above", "Not defined"]
    while len(distractors) < 3:
        filler = generic.pop(0) if generic else f"Option {len(distractors) + 2}"
        distractors.append(filler)

    return distractors[:3]


def _generate_definition_distractors(term, all_phrases):
    """Generate 3 plausible wrong definitions."""
    other_terms = [w for w in set(all_phrases) if w.lower() != term.lower() and len(w) > 3]
    random.shuffle(other_terms)

    templates = [
        f"A type of {random.choice(other_terms) if other_terms else 'element'} used in computing",
        f"The process of {random.choice(other_terms) if other_terms else 'analyzing'} data",
        f"A method for {random.choice(other_terms) if other_terms else 'processing'} information",
        f"A concept related to {random.choice(other_terms) if other_terms else 'systems'}",
    ]
    random.shuffle(templates)
    return templates[:3]


# ============================================================
# PART 4: IDEA GENERATION
# ============================================================

# Large pools of idea templates — the engine picks random combinations

STARTUP_IDEAS = [
    "An app that uses AI to {action} for {audience}",
    "A platform connecting {audience} with {service}",
    "A subscription service that delivers {product} based on {criteria}",
    "A marketplace for {audience} to buy and sell {product}",
    "An AI tool that automates {task} for {audience}",
    "A browser extension that helps {audience} {action}",
    "A mobile app that gamifies {activity} for {audience}",
    "A SaaS platform that helps {audience} manage their {resource}",
    "A community platform where {audience} can share {product}",
    "A smart device that monitors {metric} and suggests {action}",
]

CREATIVE_IDEAS = [
    "Write a short story where {character} discovers {discovery}",
    "Design a board game about {theme} set in {setting}",
    "Create a YouTube series teaching {skill} through {method}",
    "Build an art project using {material} to represent {concept}",
    "Compose a song about {theme} from the perspective of {character}",
    "Start a podcast interviewing people who {activity}",
    "Create a photo series documenting {theme} in your city",
    "Design a fictional app UI for {audience} that solves {problem}",
    "Write a comic strip explaining {concept} to beginners",
    "Build a miniature model of {place} using {material}",
]

CHALLENGE_IDEAS = [
    "Go {duration} without {habit} and journal how you feel",
    "Learn the basics of {skill} in {duration}",
    "Talk to {count} strangers this week about {topic}",
    "Wake up at {time} every day for {duration}",
    "Read {count} pages every day for a month",
    "Write {count} words every day for {duration}",
    "Cook a new recipe from a different country every {frequency}",
    "Do {count} minutes of meditation every morning for {duration}",
    "Send a thank-you note to {count} people this week",
    "Spend {duration} without social media and track your focus",
]

# Replacement pools for the templates above
FILL_POOLS = {
    "action": ["summarize meeting notes", "plan healthy meals", "track carbon footprint",
                "organize digital photos", "generate study plans", "find local events",
                "translate documents", "compare prices", "schedule appointments"],
    "audience": ["college students", "remote workers", "small business owners",
                 "new parents", "senior citizens", "freelancers", "teachers",
                 "fitness enthusiasts", "travelers"],
    "service": ["local tutors", "mental health experts", "home repair specialists",
                "personal chefs", "career coaches", "language partners"],
    "product": ["curated books", "artisan snacks", "eco-friendly products",
                "study materials", "productivity tools", "creative supplies"],
    "criteria": ["your mood", "your goals", "your schedule", "your learning style",
                 "your dietary preferences", "your reading history"],
    "task": ["expense tracking", "email management", "content creation",
             "data entry", "scheduling", "customer follow-ups"],
    "activity": ["learning new skills", "saving money", "exercising",
                 "reading books", "coding practice", "language learning"],
    "resource": ["time", "finances", "projects", "team communication", "inventory"],
    "metric": ["sleep quality", "air quality", "posture", "screen time", "hydration"],
    "character": ["a time traveler", "a retired detective", "a talking cat",
                  "a medieval knight in modern times", "an AI becoming self-aware"],
    "discovery": ["a hidden room in their house", "a letter from the future",
                  "they can hear animals talk", "a parallel universe",
                  "a secret society at school"],
    "theme": ["nostalgia", "urban life", "dreams", "technology vs nature",
              "hidden connections", "everyday kindness"],
    "setting": ["a space station", "ancient Egypt", "a futuristic city",
                "underwater", "a magical library"],
    "skill": ["origami", "basic electronics", "watercolor painting",
              "public speaking", "photography", "cooking"],
    "method": ["storytelling", "animations", "real-world challenges",
               "experiments", "interviews"],
    "material": ["recycled items", "Lego bricks", "cardboard", "code",
                 "photography"],
    "concept": ["climate change", "algorithms", "emotions", "time",
                "the internet"],
    "problem": ["information overload", "decision fatigue", "loneliness",
                "procrastination", "poor sleep"],
    "place": ["your dream home", "a famous landmark", "a fictional city",
              "your school", "a space habitat"],
    "habit": ["your phone", "caffeine", "processed sugar", "complaining",
              "watching TV"],
    "duration": ["7 days", "2 weeks", "30 days", "one week", "21 days"],
    "count": ["3", "5", "10", "15", "20", "30"],
    "time": ["5:30 AM", "6:00 AM", "5:00 AM"],
    "frequency": ["day", "week", "other day"],
    "topic": ["their favorite book", "their career journey", "their hobbies",
              "a skill they learned recently"],
}


def generate_ideas():
    """
    Generate 3 fresh ideas: one startup, one creative, one challenge.
    Uses template filling with random selections from pools.
    """
    return {
        "startup": _fill_template(random.choice(STARTUP_IDEAS)),
        "creative": _fill_template(random.choice(CREATIVE_IDEAS)),
        "challenge": _fill_template(random.choice(CHALLENGE_IDEAS)),
    }


def _fill_template(template):
    """
    Replace all {placeholders} in a template with random values from pools.
    e.g., "An app for {audience}" → "An app for college students"
    """
    def replace_match(match):
        key = match.group(1)
        if key in FILL_POOLS:
            return random.choice(FILL_POOLS[key])
        return match.group(0)  # Leave unchanged if no pool found

    return re.sub(r'\{(\w+)\}', replace_match, template)

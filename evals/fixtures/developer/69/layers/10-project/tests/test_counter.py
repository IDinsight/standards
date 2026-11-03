from tally.counter import count_words, top


def test_counts_are_case_insensitive():
    counts = count_words("The cat and the hat")
    assert counts["the"] == 2
    assert counts["cat"] == 1


def test_top_orders_by_count_then_word():
    counts = count_words("b a b c a b")
    assert top(counts, 2) == [("b", 3), ("a", 2)]

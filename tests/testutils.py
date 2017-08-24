def assert_array_equals(array_1, array_2):
  """Asserts that array_1 and array_2 contain the same items."""
  assert len(array_1) == len(array_2) and sorted(array_1) == sorted(array_2)

# Inspiration: https://www.gnu.org/software/gawk/manual/html_node/Splitting-By-Content.html

# Define custom field splitting to handle articles with commas in them
BEGIN {
  FPAT = "([^,]+)|('[^']+')"
}

{
  # Make sure the from article ID is non-zero (there seems to be one of these in the file)
  if ($1 != 0) {
    # Make sure the to namespace is an article
    if ($2 == 0) {
      # Make sure the from namespace is an article
      if ($4 == 0) {
        # Strip the quotes around the article name
        if (substr($3, 1, 1) == "'") {
          len = length($3)
          $3 = substr($3, 2, len - 2)    # Get text within the two quotes
        }

        # Print the from article ID and the to article name
        printf("%s\t%s\n", $1, $3)
      }
    }
  }
}

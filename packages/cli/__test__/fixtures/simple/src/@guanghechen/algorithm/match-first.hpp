#include <functional>

/**
 * Find the first matched position.
 */
int matchFirst(int lft, int rht, std::function<bool(int)> verify) {
  int rightBound = rht;
  while (lft < rht) {
    int mid = (lft + rht) >> 1;
    if (verify(mid))
      rht = mid;
    else
      lft = mid + 1;
  }
  return rht >= rightBound ? -1 : rht;
}

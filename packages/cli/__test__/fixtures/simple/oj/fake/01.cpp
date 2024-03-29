#include <@guanghechen/algorithm/match-first.hpp>
#include <cstdio>
#include <fstream>
#include <iostream>
using namespace std;

int main() {
#ifdef GHC_LOCAL
#define in cin
#define out cout
#else
#define in fin
#define out fout

  ofstream fout("test.out");
  ifstream fin("test.in");
#endif

  int data[5] = { 1, 2, 3, 3, 4 };

  /**
   * Multiple
   * line
   * Comments
   */
  int result = matchFirst(
    0,
    4,
    [&data](int x) -> bool { return data[x] >= 3; }
  );

  // Single line comments
  printf("result: %d\n", result);

  char s[] = "common /** this is comments */ string";
  char t[] = "common // this is comments";
  return 0;
}

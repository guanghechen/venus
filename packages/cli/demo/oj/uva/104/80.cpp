#include <queue>
#include <cstdio>
#include <cstring>
#include <lemon-clown/algorithm/netflow/isap.hpp>


int N, M;
const int MAXN = 50 + 10;
int visit[MAXN];
int main() {
    ISAP isap(MAXN);
    std::queue<int> Q;

    for(int kase=1; ; ++kase) {
        scanf("%d%d", &N, &M);
        if( N == 0 && M == 0 ) break;

        int source = 1;
        int converge = 2;
        isap.init(source, converge, N+1);
        for(int i=1; i <= M; ++i) {
            int u, v, w;
            scanf("%d%d%d", &u, &v, &w);
            isap.addEdge(u, v, w);
            isap.addEdge(v, u, w);
        }

        auto cuts = isap.mincut();
        for(auto& cut: cuts)
            printf("%d %d\n", cut.first, cut.second);

        printf("\n");
    }
    return 0;
}


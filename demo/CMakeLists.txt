cmake_minimum_required(VERSION 3.9)
project(acm)
set(CMAKE_CXX_STANDARD 11)

add_definitions(-DVENUS_USE_CMAKE)

include_directories(src)

add_executable(uva-10480  oj/uva/104/80.cpp)

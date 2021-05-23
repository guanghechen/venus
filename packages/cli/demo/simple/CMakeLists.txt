cmake_minimum_required(VERSION 3.15)
project(acm)
set(CMAKE_CXX_STANDARD 11)

include_directories(src)

add_compile_definitions(GUANGHECHEN_LOCAL_CMAKE)
add_compile_definitions(_GLIBCXX_DEBUG)

# fake problems
file(GLOB_RECURSE OJ_SOURCES oj/fake/*.cpp)
foreach(SOURCE_PATH ${OJ_SOURCES})
  get_filename_component(EXECUTABLE_NAME ${SOURCE_PATH} NAME_WE)
  add_executable("FAKE_${EXECUTABLE_NAME}" ${SOURCE_PATH})
endforeach(SOURCE_PATH ${OJ_SOURCES})

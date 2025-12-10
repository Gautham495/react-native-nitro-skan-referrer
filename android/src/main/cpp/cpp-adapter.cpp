#include <jni.h>
#include "nitroskanreferrerOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::nitroskanreferrer::initialize(vm);
}

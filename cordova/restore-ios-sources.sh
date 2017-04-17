#!/bin/bash
if [ -d "src/platforms/ios-tmp" ]
then
  # copy sourced iOS code back, so that extmd-share is in the package 
  cp -R src/platforms/ios-tmp/* src/platforms/ios
  rm -rf src/platforms/ios-tmp
fi

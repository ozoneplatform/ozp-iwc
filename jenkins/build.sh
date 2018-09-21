#!/usr/bin/env bash
source /usr/local/node_versions/set_node_version.sh 0.12.7
npm install
npm run bower
npm run build
npm run tarDate

#!/bin/bash
echo "Starting sshd:"
/usr/sbin/sshd
echo "Starting nginx in non daemon mode:"
/usr/sbin/nginx
echo "Starting node app:"
node /opt/gitSnak/bin/gitSnak
echo "Ready!"

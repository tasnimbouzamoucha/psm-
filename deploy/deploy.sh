#!/bin/bash
# Envoie psm.jar sur le VPS et redémarre le service.
# Usage : ./deploy.sh utilisateur@IP_DU_VPS
set -e
VPS="$1"
if [ -z "$VPS" ]; then echo "Usage : ./deploy.sh user@ip"; exit 1; fi
scp ../target/psm.jar "$VPS":/tmp/psm.jar
ssh "$VPS" "sudo mv /tmp/psm.jar /opt/psm/psm.jar && sudo chown psm:psm /opt/psm/psm.jar && sudo systemctl restart psm && sudo systemctl status psm --no-pager"

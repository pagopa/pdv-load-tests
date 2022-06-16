# Start cloudwatch agent

echo "AWS SESSION TOKEN $AWS_SESSION_TOKEN"
mkdir -p /root/.aws
echo "[default]" > /root/.aws/credentials
echo "aws_access_key_id = $AWS_ACCESS_KEY_ID" >> /root/.aws/credentials
echo "aws_secret_access_key = $AWS_SECRET_ACCESS_KEY" >> /root/.aws/credentials
echo "aws_session_token = $AWS_SESSION_TOKEN" >> >> /root/.aws/credentials


/opt/aws/amazon-cloudwatch-agent/bin/start-amazon-cloudwatch-agent&
sleep 10
K6_STATSD_ENABLE_TAGS=true k6 run --out statsd $1

sleep 120
cat /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
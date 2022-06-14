# Start cloudwatch agent

echo "AWS SESSION TOKEN $AWS_SESSION_TOKEN"

/opt/aws/amazon-cloudwatch-agent/bin/start-amazon-cloudwatch-agent&
sleep 10
K6_STATSD_ENABLE_TAGS=true k6 run --out statsd $1

sleep 120
cat /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
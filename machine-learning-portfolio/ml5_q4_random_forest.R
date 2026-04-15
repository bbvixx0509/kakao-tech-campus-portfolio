# 문제 4
# 랜덤포레스트 회귀 + 변수 중요도 확인

library(randomForest)

load("P4.RData")
set.seed(1000)

rf_model <- randomForest(
  MedHouseVal ~ .,
  data = P4_train,
  ntree = 1000,
  mtry = 3,
  importance = TRUE,
  do.trace = 100
)

# 결정계수
r_squared <- tail(rf_model$rsq, 1)
cat(sprintf("(1) 랜덤 포레스트 모델의 결정계수 (R^2): %.8f\n", r_squared))

# 테스트 MSE
y_hat_rf <- predict(rf_model, newdata = P4_test)
mse_rf <- mean((P4_test$MedHouseVal - y_hat_rf)^2)

cat("(2) P4_test 데이터에 대한 MSE:", mse_rf, "\n")

# 변수 중요도
varImpPlot(rf_model, main = "Variable Importance (Random Forest)")

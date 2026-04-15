# Machine Learning Portfolio

R로 작성한 머신러닝 실습 코드 모음입니다.  
각 파일은 알고리즘별로 분리되어 있으며, 코드가 어떤 값을 출력하는지와 그 값이 무엇을 의미하는지 함께 정리했습니다.

## Script Guide

### `knn_distance_comparison.R`
- What it does: Iris 데이터셋에 대해 유클리드, 맨해튼, 마할라노비스 거리 기반 k-NN 분류를 비교합니다.
- Output: 각 거리 방식의 confusion matrix와 Accuracy를 출력합니다.
- Meaning: 같은 k-NN이라도 거리 계산 방식에 따라 분류 성능이 달라질 수 있음을 확인하는 코드입니다.

### `logistic_vs_knn.R`
- What it does: 다항 로지스틱 회귀와 마할라노비스 거리 기반 k-NN을 비교합니다.
- Output: 두 모델의 분류 정확도(Accuracy, %)를 출력합니다.
- Meaning: 같은 데이터에서도 모델 가정이 다르면 분류 결과가 달라질 수 있고, 어떤 방식이 더 잘 맞는지 비교할 수 있습니다.

### `kernel_svm.R`
- What it does: 특성 확장을 적용한 뒤 선형 커널 SVM으로 분류합니다.
- Output: confusion matrix와 예측 결과표를 출력합니다.
- Meaning: 원래는 선형 분리가 어려운 데이터를 특성 확장으로 분리 가능하게 만들 수 있다는 점을 보여줍니다.

### `linear_vs_tree.R`
- What it does: 선형회귀와 의사결정나무 회귀를 같은 데이터에 적용합니다.
- Output: 두 모델의 MSE를 각각 출력합니다.
- Meaning: MSE가 작을수록 예측 오차가 적다는 뜻이며, 어떤 회귀 방식이 데이터 구조에 더 잘 맞는지 비교할 수 있습니다.

### `random_forest.R`
- What it does: 랜덤 포레스트 회귀를 적용하고 변수 중요도를 확인합니다.
- Output: 최종 R^2, 테스트 MSE, 변수 중요도 그래프를 출력합니다.
- Meaning: R^2는 설명력을, MSE는 예측 오차를 보여주며, 변수 중요도는 어떤 입력 변수가 예측에 크게 기여했는지 해석하는 데 도움이 됩니다.

### `margin_perceptron.R`
- What it does: 마진 퍼셉트론의 가중치 업데이트 과정을 단계별로 계산합니다.
- Output: 첫 관측치 반영 후 가중치, 두 번째 관측치 반영 후 가중치, 1 epoch 종료 후 가중치, 200 epoch 종료 후 최종 가중치를 출력합니다.
- Meaning: 퍼셉트론이 오분류를 줄이기 위해 가중치를 어떻게 조정하는지 직접 확인할 수 있습니다.

### `neural_network_regression.R`
- What it does: 선형회귀와 직접 구현한 신경망 회귀 모델을 비교합니다.
- Output: 선형회귀의 R^2와 신경망 모델의 R^2를 출력합니다.
- Meaning: 두 모델의 설명력을 비교하면서, 단순 회귀와 비선형 모델의 차이를 확인할 수 있습니다.

### `backpropagation.R`
- What it does: 2계층 신경망에서 순전파와 역전파를 반복하며 가중치를 갱신합니다.
- Output: 315번 학습 후 최종 출력값 `y_hat`을 출력합니다.
- Meaning: 역전파가 반복되면서 예측값이 목표값에 가까워지도록 가중치가 조정되는 과정을 보여줍니다.

### `perceptron_learning.R`
- What it does: 9개의 이진 입력에 대해 퍼셉트론 학습을 수행합니다.
- Output: epoch마다 오분류 개수, 학습 완료 epoch 수, 최종 가중치를 출력합니다.
- Meaning: epoch가 진행될수록 오분류 수가 줄어드는지 확인하면서, 선형 분류기가 학습되는 흐름을 볼 수 있습니다.

### `information_gain.R`
- What it does: Play 데이터셋의 정보이득을 계산합니다.
- Output: 각 변수의 information gain 값을 출력합니다.
- Meaning: 값이 큰 변수일수록 분할 기준으로서 더 유용하다는 뜻이며, 의사결정나무의 속성 선택 원리를 이해하는 데 도움이 됩니다.

### `neural_network_forward.R`
- What it does: 간단한 신경망의 순전파 계산과 손실값 계산을 수행합니다.
- Output: 예측값 `y_hat`과 loss 값을 출력합니다.
- Meaning: 순전파를 거친 결과가 실제 목표값과 얼마나 차이가 나는지 loss로 확인할 수 있습니다.

## Main Metrics

- `Accuracy`: 분류 문제에서 전체 예측 중 맞춘 비율
- `Confusion Matrix`: 클래스별로 무엇을 맞추고 틀렸는지 보여주는 표
- `MSE`: 예측값과 실제값 차이의 제곱 평균으로, 작을수록 좋음
- `R^2`: 모델이 데이터를 얼마나 잘 설명하는지 나타내는 값
- `Loss`: 신경망 예측값과 목표값 차이를 수치로 나타낸 값

## Notes

- README에서는 각 코드가 출력하는 핵심 값과 해석 포인트를 중심으로 정리했습니다.
- 일부 스크립트는 `caret`, `class`, `kknn`, `nnet`, `e1071`, `rpart`, `randomForest`, `FSelector` 패키지를 사용합니다.
- `P1.RData`, `P2.RData`, `P3.RData`, `P4.RData`, `P6.RData` 같은 실습 데이터 파일이 필요한 코드가 포함되어 있습니다.

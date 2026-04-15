# Machine Learning Portfolio

R로 정리한 머신러닝 실습 코드 모음입니다.  
분류, 회귀, 퍼셉트론, 신경망 기초 실습을 파일별로 나눠 정리했고, 각 코드가 어떤 값을 출력하는지와 그 의미를 함께 읽을 수 있게 구성했습니다.

## 코드 안내

- `knn_distance_comparison.R`: k-NN에서 거리 계산 방식이 달라질 때 정확도가 어떻게 달라지는지 비교합니다.
- `logistic_vs_knn.R`: 로지스틱 회귀와 k-NN 분류 결과를 비교합니다.
- `kernel_svm.R`: 특성 확장을 적용한 선형 커널 SVM 분류 예제를 담았습니다.
- `linear_vs_tree.R`: 선형회귀와 의사결정나무 회귀의 MSE를 비교합니다.
- `random_forest.R`: 랜덤 포레스트 회귀의 R^2, MSE, 변수 중요도를 확인합니다.
- `margin_perceptron.R`: 마진 퍼셉트론의 가중치 업데이트 과정을 단계별로 계산합니다.
- `neural_network_regression.R`: 선형회귀와 직접 구현한 신경망 회귀 결과를 비교합니다.
- `backpropagation.R`: 역전파를 반복하면서 가중치가 갱신되는 과정을 다룹니다.
- `perceptron_learning.R`: 퍼셉트론이 epoch를 거치며 학습되는 흐름을 보여줍니다.
- `information_gain.R`: 정보이득 값을 계산해 어떤 변수가 더 중요한지 확인합니다.
- `neural_network_forward.R`: 간단한 신경망의 순전파와 loss 계산 과정을 정리했습니다.

## 읽는 포인트

- `Accuracy`, `MSE`, `R^2`, `Loss`처럼 결과를 해석하는 기본 지표
- 모델별 출력값이 무엇을 뜻하는지 설명을 함께 붙여둔 점
- 단순히 코드를 모은 것이 아니라, 실습 내용을 다시 읽기 쉽게 정리한 점

## 참고

- 일부 코드는 `caret`, `class`, `kknn`, `nnet`, `e1071`, `rpart`, `randomForest`, `FSelector` 패키지를 사용합니다.
- 실습 데이터가 필요한 스크립트는 별도의 `.RData` 파일을 전제로 작성되어 있습니다.

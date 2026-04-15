# 머신러닝 포트폴리오

R로 작성한 머신러닝 실습 코드를 주제별로 정리한 폴더입니다.  
파일이 한 번에 너무 많이 보이지 않도록 `분류`, `회귀`, `신경망`, `기초개념`으로 나누었고, 각 파일이 어떤 알고리즘을 다루는지 README에서 바로 확인할 수 있도록 정리했습니다.

## 폴더 안내

### `분류`

- `knn_distance_comparison.R`: k-NN에서 거리 계산 방식에 따라 분류 결과가 어떻게 달라지는지 비교하는 파일입니다.
- `logistic_vs_knn.R`: 로지스틱 회귀와 k-NN을 같은 데이터에서 비교하는 파일입니다.
- `kernel_svm.R`: 커널 SVM을 이용해 분류 문제를 해결하는 파일입니다.

### `회귀`

- `linear_vs_tree.R`: 선형 회귀와 회귀 트리를 비교하는 파일입니다.
- `random_forest.R`: 랜덤 포레스트 회귀를 적용해 예측 성능을 확인하는 파일입니다.

### `신경망`

- `backpropagation.R`: 역전파 계산 과정을 단계별로 확인하는 파일입니다.
- `neural_network_forward.R`: 순전파 계산 과정을 직접 확인하는 파일입니다.
- `neural_network_regression.R`: 신경망을 이용한 회귀 예측 실습 파일입니다.

### `기초개념`

- `margin_perceptron.R`: 마진 퍼셉트론 개념을 실습하는 파일입니다.
- `perceptron_learning.R`: 퍼셉트론 학습 과정을 확인하는 파일입니다.
- `information_gain.R`: 정보 이득 계산을 통해 분할 기준을 확인하는 파일입니다.

## 실행 결과 예시

### k-NN 결과 화면
<img src="../README%20이미지/머신러닝%20포트폴리오/knn_output.png" alt="k-NN 결과 화면" width="540">

### 퍼셉트론 학습 화면
<img src="../README%20이미지/머신러닝%20포트폴리오/perceptron_output.png" alt="퍼셉트론 학습 화면" width="540">

### 신경망 결과 화면
<img src="../README%20이미지/머신러닝%20포트폴리오/neural_network_output.png" alt="신경망 결과 화면" width="500">

## 이 폴더를 볼 때 확인하면 좋은 점

- 분류, 회귀, 신경망 코드를 주제별로 나눠 정리한 방식
- `Accuracy`, `MSE`, `R^2`, `Loss` 같은 기본 지표를 코드에서 어떻게 확인하는지
- 단순 실행용 코드가 아니라, 알고리즘 개념을 직접 따라가며 확인할 수 있도록 파일을 나눈 방식

## 참고

- 일부 코드에는 `caret`, `class`, `kknn`, `nnet`, `e1071`, `rpart`, `randomForest`, `FSelector` 패키지가 사용됩니다.
- 데이터 파일이 필요한 경우에는 별도의 `.RData` 파일을 함께 불러오도록 작성된 스크립트가 있습니다.

# Machine Learning Portfolio

PDF로 정리해두었던 머신러닝 과제를 실행 가능한 R 스크립트 형태로 다시 정리한 폴더입니다.
각 파일은 실습 주제별로 분리되어 있어, 어떤 알고리즘을 다뤘는지 바로 확인할 수 있습니다.

## Included Scripts

- `knn_distance_comparison.R`: Iris 데이터셋으로 유클리드, 맨해튼, 마할라노비스 거리 기반 k-NN 성능을 비교합니다.
- `logistic_vs_knn.R`: 다항 로지스틱 회귀와 마할라노비스 거리 기반 k-NN 분류를 비교합니다.
- `kernel_svm.R`: 특성 확장 후 선형 커널 SVM으로 분류를 수행합니다.
- `linear_vs_tree.R`: 선형회귀와 의사결정나무 회귀 결과를 비교합니다.
- `random_forest.R`: 랜덤 포레스트 회귀와 변수 중요도를 확인합니다.
- `margin_perceptron.R`: 마진 퍼셉트론 학습 과정을 단계별로 계산합니다.
- `neural_network_regression.R`: 선형회귀와 신경망 예측 결과를 비교합니다.
- `backpropagation.R`: 2계층 신경망의 순전파와 역전파 계산 과정을 다룹니다.
- `perceptron_learning.R`: 퍼셉트론 학습 규칙으로 이진 분류 경계를 갱신합니다.
- `information_gain.R`: 정보이득을 이용해 분할 기준을 계산합니다.
- `neural_network_forward.R`: 간단한 신경망의 순전파와 손실 계산을 정리합니다.

## Main Topics

- k-NN, 로지스틱 회귀, SVM 같은 기본 분류 알고리즘
- 선형회귀, 의사결정나무, 랜덤 포레스트 회귀 비교
- 퍼셉트론, 순전파, 역전파를 포함한 신경망 기초 실습
- 정보이득 계산과 특성 선택 개념 정리

## Notes

- 기존 PDF 자료는 제거하고, GitHub에서 바로 읽기 쉬운 R 코드 중심으로 정리했습니다.
- 일부 스크립트는 `caret`, `class`, `kknn`, `nnet`, `e1071`, `rpart`, `randomForest`, `FSelector` 패키지를 사용합니다.

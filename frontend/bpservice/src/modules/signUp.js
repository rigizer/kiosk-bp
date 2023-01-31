import { createAction, handleActions } from "redux-actions";
import { call, put, takeEvery, takeLatest } from "redux-saga/effects";
import { RestClient } from "@bootpay/server-rest-client";
import axios from "axios";

const GET_CERTIFYCATION = "signUp/GET_CERTIFYCATION";
const SET_CERTIFYCATION = "signUp/SET_CERTIFYCATION";
const SUCCESS_CERTIFYCATION = "signUp/SUCCESS_CERTIFYCATION";
const ERROR_CERTIFYCATION = "signUp/ERROR_CERTIFYCATION";
const ERROR_CERTIFYCATION_RESET = "signUp/ERROR_CERTIFYCATION_RESET";

const SIGN_UP_REQUIREMENT = "signUp/SIGN_UP_REQUIREMENT";
const SIGN_UP_SUCCESS = "signUp/SIGN_UP_SUCCESS";
const SIGN_UP_FAILURE = "signUp/SIGN_UP_FAILURE";
const SIGN_UP_FAILURE_RESET = "signUp/SIGN_UP_FAILURE_RESET";

const GET_SIDO_DATA = "signUp/GET_SIDO_DATA";
const SET_SIDO_DATA = "signUp/SET_SIDO_DATA";

const GET_GUGUN_DATA = "signUp/GET_GUGUN_DATA";
const SET_GUGUN_DATA = "signUp/SET_GUGUN_DATA";

const GET_DONG_DATA = "signUp/GET_DONG_DATA";
const SET_DONG_DATA = "signUp/SET_DONG_DATA";

const CHECK_CERTIFICATION_NUM = "signUp/CHECK_CERTIFICATION_NUM";

const getCertification = createAction(GET_CERTIFYCATION, (data) => data);
const sighUpRequirement = createAction(SIGN_UP_REQUIREMENT, (data) => data);
const getSidoData = createAction(GET_SIDO_DATA, () => undefined);
const getGugun = createAction(GET_GUGUN_DATA, (data) => data);
const getDong = createAction(GET_DONG_DATA, (data) => data);
const checkCertificationNum = createAction(
  CHECK_CERTIFICATION_NUM,
  (num) => num
);
const signUpFailureReset = createAction(SIGN_UP_FAILURE_RESET, () => undefined);
const errorCertifycationReset = createAction(
  ERROR_CERTIFYCATION_RESET,
  () => undefined
);

const API = `http://192.168.100.79:8080`;

// 인증번호 요청 saga
function* getCertifi(data) {
  const info = data.payload;

  try {
    const post = yield call(() => {
      return axios({
        method: "post",
        url: `${API}/api/user/join/sms-request`,
        data: {
          phoneNum: info,
        },
      });
    });
    yield put({ type: SET_CERTIFYCATION, success: true });
  } catch (e) {
    yield put({ type: ERROR_CERTIFYCATION, error: true });
  }
}

// 인증번호 확인 Saga
function* checkCertifiNumFnc(data) {
  const CERTIFICATION_NUM = data.payload;
  console.log(CERTIFICATION_NUM.authNum, CERTIFICATION_NUM.phone);
  try {
    const post = yield call(() => {
      return axios({
        method: "post",
        url: `${API}/api/user/join/sms-auth`,
        data: {
          authNum: CERTIFICATION_NUM.authNum,
          phoneNum: CERTIFICATION_NUM.phoneNum,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
    if (post.status === 200) {
      yield put({ type: SUCCESS_CERTIFYCATION, success: true });
    }
  } catch (e) {}
}

// 회원가입 요청 Saga
function* getSignUp(data) {
  const userInfoData = data.payload;
  try {
    const post = yield call(() => {
      axios({
        method: "post",
        url: `${API}/api/user/join`,
        data: {
          userId: userInfoData.id,
          pwd: userInfoData.pwd,
          userName: userInfoData.userName,
          phoneNum: userInfoData.phone,
          sido: userInfoData.sido,
          sigungu: userInfoData.gugun,
          dong: userInfoData.dong,
          email: userInfoData.email,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    yield put({ type: SIGN_UP_SUCCESS, success: true });
  } catch (e) {
    yield put({ type: SIGN_UP_FAILURE, error: true });
  }
}

// 시도 요청하는 함수
function* getSidoFnc() {
  try {
    const get = yield call(() => {
      return axios({
        method: "get",
        url: `${API}/api/address/first-depth`,
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
    if (get.status === 200) {
      yield put({ type: SET_SIDO_DATA, payload: get.data });
    }
  } catch (e) {}
}

// 구군 요청하는 함수
function* getGugunFnc(data) {
  try {
    const get = yield call(() => {
      return axios({
        method: "get",
        url: `${API}/api/address/second-depth`,
        params: {
          sido: data.payload,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
    if (get.status === 200) {
      yield put({ type: SET_GUGUN_DATA, payload: get.data });
    }
  } catch (e) {}
}

// 동 요청하는 함수
function* getDongFnc(data) {
  console.log(data);
  try {
    const get = yield call(() => {
      return axios({
        method: "get",
        url: `${API}/api/address/third-depth`,
        params: {
          sido: data.payload.sido,
          sigungu: data.payload.gugun,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
    if (get.status === 200) {
      yield put({ type: SET_DONG_DATA, payload: get.data });
    }
  } catch (e) {}
}

export function* certifiSaga() {
  yield takeLatest(GET_CERTIFYCATION, getCertifi);
  yield takeLatest(SIGN_UP_REQUIREMENT, getSignUp);
  yield takeLatest(GET_SIDO_DATA, getSidoFnc);
  yield takeLatest(GET_GUGUN_DATA, getGugunFnc);
  yield takeLatest(GET_DONG_DATA, getDongFnc);
  yield takeLatest(CHECK_CERTIFICATION_NUM, checkCertifiNumFnc);
}

const initialState = { sido: [], gugun: [], dong: [] };

const signUpReducer = handleActions(
  {
    [SET_CERTIFYCATION]: (state, action) => {
      return { ...state, isCertifyNum: action.success };
    },
    [ERROR_CERTIFYCATION]: (state, action) => {
      return { ...state, isCertifyNumError: action.error };
    },
    [ERROR_CERTIFYCATION_RESET]: (state, action) => {
      return { ...state, isCertifyNumError: false };
    },
    [SUCCESS_CERTIFYCATION]: (state, action) => {
      return { ...state, successCertifycation: action.success };
    },
    [SET_SIDO_DATA]: (state, action) => {
      return { ...state, sido: action.payload };
    },
    [SET_GUGUN_DATA]: (state, action) => {
      return { ...state, gugun: action.payload };
    },
    [SET_DONG_DATA]: (state, action) => {
      return { ...state, dong: action.payload };
    },
    [SIGN_UP_SUCCESS]: (state, action) => {
      return { signUpSuccess: action.success };
    },
    [SIGN_UP_FAILURE]: (state, action) => {
      return { ...state, signUpFailure: action.error };
    },
    [SIGN_UP_FAILURE_RESET]: (state, action) => {
      return { ...state, signUpFailure: false };
    },
  },
  initialState
);

export const userInfo = {
  getCertification,
  sighUpRequirement,
  getSidoData,
  getGugun,
  getDong,
  checkCertificationNum,
  signUpFailureReset,
  errorCertifycationReset,
};

export default signUpReducer;

(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["reserve-reserve-module"],{

/***/ "./src/app/guards/reservation.guard.ts":
/*!*********************************************!*\
  !*** ./src/app/guards/reservation.guard.ts ***!
  \*********************************************/
/*! exports provided: ReservationGuard */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReservationGuard", function() { return ReservationGuard; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var src_app_state_reservation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/state/reservation */ "./src/app/state/reservation/index.ts");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var ReservationGuard = /** @class */ (function () {
    function ReservationGuard(store, router) {
        this.store = store;
        this.router = router;
        this.reservation$ = this.store.select(src_app_state_reservation__WEBPACK_IMPORTED_MODULE_3__["getReservation"]);
    }
    ReservationGuard.prototype.canActivate = function (next, state) {
        var _this = this;
        return this.reservation$.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_4__["map"])(function (r) {
            var isValidReservation = r && r.location !== undefined;
            if (!isValidReservation) {
                console.info('bad reservation, starting over');
                _this.router.navigate(['/tabs/reserve']);
            }
            return true;
        }));
    };
    ReservationGuard = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({
            providedIn: 'root',
        }),
        __metadata("design:paramtypes", [_ngrx_store__WEBPACK_IMPORTED_MODULE_2__["Store"], _angular_router__WEBPACK_IMPORTED_MODULE_1__["Router"]])
    ], ReservationGuard);
    return ReservationGuard;
}());



/***/ }),

/***/ "./src/app/reserve/components/confirmation/confirmation.component.html":
/*!*****************************************************************************!*\
  !*** ./src/app/reserve/components/confirmation/confirmation.component.html ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-card *ngIf=\"(reservation$ | async) as reservation\">\n  <ion-card-content>\n    <ion-list id=\"length\">\n      <ion-radio-group (ionChange)=\"onLengthChange($event)\">\n        <ion-list-header *ngIf=\"!isEditMode\"> Reservation Length </ion-list-header>\n        <ion-list-header *ngIf=\"isEditMode\"> Extend Reservation Length </ion-list-header>\n        <ion-item *ngFor=\"let p of availablePlans\">\n          <ion-label flex ion-justify-items-end>\n            <span\n              >{{ p.title }}\n              <ion-chip *ngIf=\"p.disabled; else enabled\" outline=\"true\"> <ion-label>Disabled Today</ion-label> </ion-chip>\n              <!-- <ng-template #enabled> -->\n                <!-- <ion-chip color=\"primary\"> <ion-label>Free Change</ion-label> </ion-chip> -->\n              <!-- </ng-template> -->\n            </span>\n            <div flex ion-align-items-center float-right>\n              <img class=\"coin ion-float-right\" src=\"./assets/coin.svg\" width=\"22\" height=\"22\" />\n              <span>{{ p.tokens }}</span>\n            </div>\n          </ion-label>\n          <ion-radio slot=\"start\" value=\"{{ p.minutes }}\" [disabled]=\"saving || p.disabled\" checked></ion-radio>\n        </ion-item>\n      </ion-radio-group>\n    </ion-list>\n    <p class=\"ion-text-center\" padding-top>\n      <!-- show always -->\n      <span\n        >You are tuning <b>TV {{ reservation.box.label }}</b> to <b>{{ reservation.program.channelTitle }} </b></span\n      >\n      <!-- show if new and reserving, or editing -->\n      <span *ngIf=\"reservation.reserve || isEditMode; else oneTime\">\n        and reserving until <b>{{ reservationEnd$ | async | amDateFormat: 'h:mma' }}</b\n        >. You will be able to freely change the channel during your reservation.\n      </span>\n      <!-- show when new and not reserving -->\n      <ng-template #oneTime> <span *ngIf=\"!editMode\">but others will be able to change the channel</span> </ng-template>\n      <br />\n      <br />\n    </p>\n    <ion-button\n      color=\"success\"\n      size=\"large\"\n      expand=\"block\"\n      (click)=\"onConfirm(reservation)\"\n      slot=\"end\"\n      [disabled]=\"saving || !sufficientFunds\"\n      margin-top\n      align-items-center\n    >\n      <ion-row *ngIf=\"!saving; else isSaving\">\n        <span>Confirm</span> <img class=\"coin\" src=\"./assets/coin.svg\" width=\"22\" height=\"22\" padding-start />\n        <span>{{ reservation.cost }}</span>\n      </ion-row>\n      <ng-template #isSaving>\n        Tuning\n        <ion-spinner name=\"crescent\" margin-start></ion-spinner>\n      </ng-template>\n    </ion-button>\n    <ion-row class=\"ion-text-center\" *ngIf=\"reservation.location && reservation.location.name\">\n      <p class=\"center\">{{ reservation.location.name }} ({{ reservation.location.neighborhood }})</p></ion-row\n    >\n    <ion-row class=\"ion-text-center\" *ngIf=\"!sufficientFunds\" margin-top>\n      <ion-text color=\"danger\">\n        Heads up! You only have {{ tokenCount }} <span *ngIf=\"tokenCount && tokenCount === 1; else tokens\">token</span\n        ><ng-template #tokens>tokens</ng-template> remaining. Please\n        <span *ngIf=\"!isLoggedIn\"><a [routerLink]=\"'/tabs/profile'\">login</a> and </span>\n        <a [routerLink]=\"'/tabs/profile'\" *ngIf=\"isLoggedIn\">add funds</a><span *ngIf=\"!isLoggedIn\">add funds</span>.\n      </ion-text>\n    </ion-row>\n  </ion-card-content>\n</ion-card>\n"

/***/ }),

/***/ "./src/app/reserve/components/confirmation/confirmation.component.scss":
/*!*****************************************************************************!*\
  !*** ./src/app/reserve/components/confirmation/confirmation.component.scss ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "ion-spinner {\n  vertical-align: middle; }\n\nion-icon.sport {\n  display: inline; }\n\nion-icon.sport[name='basketball'] {\n    color: #fa8320; }\n\nion-icon.sport[name='american-football'] {\n    color: #624a2e; }\n\nion-icon.sport ::ng-deep svg {\n    height: 30px; }\n\n.coin {\n  display: inline-block;\n  width: inherit;\n  padding-right: 4px; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aW1naWJsaW4vQ29kZS9jbGlja2VyL21vYmlsZS9hcHAvc3JjL2FwcC9yZXNlcnZlL2NvbXBvbmVudHMvY29uZmlybWF0aW9uL2NvbmZpcm1hdGlvbi5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLHNCQUFzQixFQUFBOztBQUl4QjtFQUNFLGVBQWUsRUFBQTs7QUFEakI7SUFHSSxjQUFjLEVBQUE7O0FBSGxCO0lBTUksY0FBYyxFQUFBOztBQU5sQjtJQVNJLFlBQVksRUFBQTs7QUFJaEI7RUFDRSxxQkFBcUI7RUFDckIsY0FBYztFQUNkLGtCQUFrQixFQUFBIiwiZmlsZSI6InNyYy9hcHAvcmVzZXJ2ZS9jb21wb25lbnRzL2NvbmZpcm1hdGlvbi9jb25maXJtYXRpb24uY29tcG9uZW50LnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyJpb24tc3Bpbm5lciB7XG4gIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG59XG5cbi8vIFRPRE8gZHVwbGljYXRlZFxuaW9uLWljb24uc3BvcnQge1xuICBkaXNwbGF5OiBpbmxpbmU7XG4gICZbbmFtZT0nYmFza2V0YmFsbCddIHtcbiAgICBjb2xvcjogI2ZhODMyMDtcbiAgfVxuICAmW25hbWU9J2FtZXJpY2FuLWZvb3RiYWxsJ10ge1xuICAgIGNvbG9yOiAjNjI0YTJlO1xuICB9XG4gIDo6bmctZGVlcCBzdmcge1xuICAgIGhlaWdodDogMzBweDtcbiAgfVxufVxuXG4uY29pbiB7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgd2lkdGg6IGluaGVyaXQ7XG4gIHBhZGRpbmctcmlnaHQ6IDRweDtcbn1cblxuLy8gI2xlbmd0aCB7XG4vLyAgIGlvbi1sYWJlbCB7XG4vLyAgICAgZGlzcGxheTogZmxleDtcbi8vICAgfVxuLy8gfVxuIl19 */"

/***/ }),

/***/ "./src/app/reserve/components/confirmation/confirmation.component.ts":
/*!***************************************************************************!*\
  !*** ./src/app/reserve/components/confirmation/confirmation.component.ts ***!
  \***************************************************************************/
/*! exports provided: ConfirmationComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConfirmationComponent", function() { return ConfirmationComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _reserve_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../reserve.service */ "./src/app/reserve/reserve.service.ts");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var src_app_state_reservation__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/state/reservation */ "./src/app/state/reservation/index.ts");
/* harmony import */ var _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../state/reservation/reservation.actions */ "./src/app/state/reservation/reservation.actions.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var src_app_state_user__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! src/app/state/user */ "./src/app/state/user/index.ts");
/* harmony import */ var _ngrx_effects__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @ngrx/effects */ "./node_modules/@ngrx/effects/fesm5/effects.js");
/* harmony import */ var ngx_segment_analytics__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ngx-segment-analytics */ "./node_modules/ngx-segment-analytics/index.js");
/* harmony import */ var src_app_globals__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! src/app/globals */ "./src/app/globals.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};














var ConfirmationComponent = /** @class */ (function () {
    function ConfirmationComponent(store, reserveService, router, toastController, actions$, segment, globals) {
        this.store = store;
        this.reserveService = reserveService;
        this.router = router;
        this.toastController = toastController;
        this.actions$ = actions$;
        this.segment = segment;
        this.globals = globals;
        this.title = 'Confirmation';
        this.reservationPlans = [
            {
                tokens: 1,
                title: 'Change Channel',
                minutes: 0,
            },
            {
                tokens: 2,
                title: '30 minutes',
                minutes: 30,
                reserve: true,
                disabled: true,
            },
            {
                tokens: 4,
                title: '60 minutes',
                minutes: 60,
                reserve: true,
                disabled: true,
            },
        ];
        this.reservation$ = this.store.select(src_app_state_reservation__WEBPACK_IMPORTED_MODULE_4__["getReservation"]);
        this.reserveService.emitTitle(this.title);
        this.tokenCount$ = this.store.select(src_app_state_user__WEBPACK_IMPORTED_MODULE_10__["getUserTokenCount"]);
        this.isLoggedIn$ = this.store.select(src_app_state_user__WEBPACK_IMPORTED_MODULE_10__["isLoggedIn"]);
    }
    ConfirmationComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.reservation$
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_9__["filter"])(function (r) { return r !== null; }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_9__["first"])())
            .subscribe(function (reservation) {
            _this.reservation = reservation;
            if (reservation.id) {
                _this.isEditMode = true;
            }
        });
        this.tokenCount$.subscribe(function (tokens) {
            _this.tokenCount = tokens;
        });
        this.isLoggedIn$.subscribe(function (isLoggedIn) {
            _this.isLoggedIn = isLoggedIn;
        });
    };
    Object.defineProperty(ConfirmationComponent.prototype, "availablePlans", {
        get: function () {
            if (this.isEditMode) {
                this.reservationPlans[0].title = "Don't extend";
                this.reservationPlans[0].tokens = 0;
            }
            return this.reservationPlans;
        },
        enumerable: true,
        configurable: true
    });
    ConfirmationComponent.prototype.onLengthChange = function (e) {
        var _this = this;
        var plan = this.reservationPlans.find(function (p) { return p.minutes === +e.detail.value; });
        this.reservation.cost = plan.tokens;
        // const endTimeInitial = this.reservation.end ? moment(this.reservation.end) : moment();
        this.reservation.minutes = plan.minutes;
        this.reservation.reserve = plan.reserve;
        this.checkWallet();
        this.reservationEnd$ = Object(rxjs__WEBPACK_IMPORTED_MODULE_2__["interval"])(15 * 1000).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_9__["startWith"])(this.getInitialEndTime()
            .clone()
            .add(plan.minutes, 'm')
            .toDate()), // this sets inital value
        Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_9__["map"])(function () {
            return _this.getInitialEndTime()
                .clone()
                .add(plan.minutes, 'm')
                .toDate();
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_9__["distinctUntilChanged"])());
    };
    ConfirmationComponent.prototype.checkWallet = function () {
        this.tokenCount >= this.reservation.cost ? (this.sufficientFunds = true) : (this.sufficientFunds = false);
    };
    ConfirmationComponent.prototype.getInitialEndTime = function () {
        return this.reservation.end ? moment__WEBPACK_IMPORTED_MODULE_7__(this.reservation.end) : moment__WEBPACK_IMPORTED_MODULE_7__();
    };
    ConfirmationComponent.prototype.onConfirm = function () {
        var _this = this;
        var r = this.reservation;
        this.saving = true;
        this.isEditMode
            ? this.store.dispatch(new _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_5__["Update"](r))
            : this.store.dispatch(new _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_5__["Create"](r));
        var reservation = r;
        this.actions$
            .pipe(Object(_ngrx_effects__WEBPACK_IMPORTED_MODULE_11__["ofType"])(_state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_5__["CREATE_RESERVATION_SUCCESS"], _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_5__["UPDATE_RESERVATION_SUCCESS"]))
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_9__["first"])())
            .subscribe(function () {
            if (_this.isEditMode) {
                _this.segment.track(_this.globals.events.reservation.updated, {
                    minutes: r.minutes,
                    locationName: r.location.name,
                    locationNeighborhood: r.location.neighborhood,
                    channelName: r.program.channelTitle,
                    channelNumber: r.program.channel,
                    programName: r.program.title,
                    programDescription: r.program.description,
                });
            }
            else {
                _this.segment.track(_this.globals.events.reservation.created, {
                    minutes: r.minutes,
                    locationName: r.location.name,
                    locationNeighborhood: r.location.neighborhood,
                    channelName: r.program.channelTitle,
                    channelNumber: r.program.channel,
                    programName: r.program.title,
                    programDescription: r.program.description,
                });
            }
            _this.store.dispatch(new _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_5__["Start"]());
            _this.router.navigate(['/tabs/profile']);
            _this.showTunedToast(reservation.box.label, reservation.program.channelTitle);
        });
        this.actions$
            .pipe(Object(_ngrx_effects__WEBPACK_IMPORTED_MODULE_11__["ofType"])(_state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_5__["CREATE_RESERVATION_FAIL"], _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_5__["UPDATE_RESERVATION_FAIL"]))
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_9__["first"])())
            .subscribe(function () {
            // this.store.dispatch(new fromReservation.Start());
            // this.router.navigate(['/tabs/profile']);
            _this.showErrorToast();
            _this.saving = false;
        });
    };
    ConfirmationComponent.prototype.showTunedToast = function (label, channelName) {
        return __awaiter(this, void 0, void 0, function () {
            var toast;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.toastController.create({
                            message: "TV " + label + " successfully changed to " + channelName,
                            duration: 2000,
                            cssClass: 'ion-text-center',
                        })];
                    case 1:
                        toast = _a.sent();
                        toast.present();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfirmationComponent.prototype.showErrorToast = function () {
        return __awaiter(this, void 0, void 0, function () {
            var toast;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.toastController.create({
                            message: "Something went wrong, please try again",
                            duration: 2000,
                            cssClass: 'ion-text-center',
                            color: 'danger',
                        })];
                    case 1:
                        toast = _a.sent();
                        toast.present();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfirmationComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-confirmation',
            template: __webpack_require__(/*! ./confirmation.component.html */ "./src/app/reserve/components/confirmation/confirmation.component.html"),
            styles: [__webpack_require__(/*! ./confirmation.component.scss */ "./src/app/reserve/components/confirmation/confirmation.component.scss")]
        }),
        __metadata("design:paramtypes", [_ngrx_store__WEBPACK_IMPORTED_MODULE_3__["Store"],
            _reserve_service__WEBPACK_IMPORTED_MODULE_1__["ReserveService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_8__["ToastController"],
            _ngrx_effects__WEBPACK_IMPORTED_MODULE_11__["Actions"],
            ngx_segment_analytics__WEBPACK_IMPORTED_MODULE_12__["SegmentService"],
            src_app_globals__WEBPACK_IMPORTED_MODULE_13__["Globals"]])
    ], ConfirmationComponent);
    return ConfirmationComponent;
}());



/***/ }),

/***/ "./src/app/reserve/components/locations/location/location.component.html":
/*!*******************************************************************************!*\
  !*** ./src/app/reserve/components/locations/location/location.component.html ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-item-sliding [ngClass]=\"{ inactive: !isAvailable() }\" [disabled]=\"!isAvailable() || !isManager()\" #slidingItem>\n  <ion-item-options side=\"start\">\n    <ion-item-option (click)=\"onManageClick(slidingItem)\">Manage</ion-item-option>\n  </ion-item-options>\n  <ion-item>\n    <ion-card (click)=\"isAvailable() && onLocationClick()\" no-margin>\n      <ion-card-header>\n        <ion-card-subtitle>\n          <span>{{ location.neighborhood }} <span *ngIf=\"!isAvailable()\">(inactive)</span></span>\n          <ion-icon *ngIf=\"!location.connected\" name=\"wifi\" class=\"disconnected\"></ion-icon>\n          <ion-icon *ngIf=\"isManager()\" name=\"star\" class=\"manage\"></ion-icon>\n\n          <span float-right *ngIf=\"location.distance\">\n            <span *ngIf=\"location.distance >= 0.2; else near\"> {{ location.distance }} miles </span>\n            <ng-template #near> Near </ng-template>\n          </span>\n        </ion-card-subtitle>\n      </ion-card-header>\n      <ion-card-content no-padding-top>\n        <img [src]=\"location.img\" class=\"logo\" />\n        <h1>{{ location.name }}</h1>\n      </ion-card-content>\n    </ion-card>\n  </ion-item>\n</ion-item-sliding>\n"

/***/ }),

/***/ "./src/app/reserve/components/locations/location/location.component.scss":
/*!*******************************************************************************!*\
  !*** ./src/app/reserve/components/locations/location/location.component.scss ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "img.logo {\n  height: 40px;\n  width: inherit;\n  float: left;\n  padding: 0 10px 10px 0; }\n\n.inactive {\n  opacity: 0.4; }\n\nion-icon.disconnected {\n  color: var(--ion-color-danger); }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aW1naWJsaW4vQ29kZS9jbGlja2VyL21vYmlsZS9hcHAvc3JjL2FwcC9yZXNlcnZlL2NvbXBvbmVudHMvbG9jYXRpb25zL2xvY2F0aW9uL2xvY2F0aW9uLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsWUFBWTtFQUNaLGNBQWM7RUFDZCxXQUFXO0VBQ1gsc0JBQXNCLEVBQUE7O0FBR3hCO0VBQ0UsWUFBWSxFQUFBOztBQUdkO0VBQ0UsOEJBQThCLEVBQUEiLCJmaWxlIjoic3JjL2FwcC9yZXNlcnZlL2NvbXBvbmVudHMvbG9jYXRpb25zL2xvY2F0aW9uL2xvY2F0aW9uLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiaW1nLmxvZ28ge1xuICBoZWlnaHQ6IDQwcHg7XG4gIHdpZHRoOiBpbmhlcml0O1xuICBmbG9hdDogbGVmdDtcbiAgcGFkZGluZzogMCAxMHB4IDEwcHggMDtcbn1cblxuLmluYWN0aXZlIHtcbiAgb3BhY2l0eTogMC40O1xufVxuXG5pb24taWNvbi5kaXNjb25uZWN0ZWQge1xuICBjb2xvcjogdmFyKC0taW9uLWNvbG9yLWRhbmdlcik7XG59XG4iXX0= */"

/***/ }),

/***/ "./src/app/reserve/components/locations/location/location.component.ts":
/*!*****************************************************************************!*\
  !*** ./src/app/reserve/components/locations/location/location.component.ts ***!
  \*****************************************************************************/
/*! exports provided: LocationComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LocationComponent", function() { return LocationComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var LocationComponent = /** @class */ (function () {
    function LocationComponent() {
        this.onClick = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.onManage = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    LocationComponent.prototype.isManager = function () {
        var _a = this, userLocations = _a.userLocations, userRoles = _a.userRoles;
        if (userLocations && userRoles) {
            return userLocations.indexOf(this.location.id) > -1 || userRoles.indexOf('superman') > -1;
        }
    };
    LocationComponent.prototype.isAvailable = function () {
        return this.location.active && this.location.connected;
    };
    LocationComponent.prototype.onLocationClick = function () {
        this.onClick.emit(this.location);
    };
    LocationComponent.prototype.onManageClick = function (slidingItem) {
        this.onManage.emit(this.location);
        slidingItem.close();
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], LocationComponent.prototype, "location", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Array)
    ], LocationComponent.prototype, "userLocations", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Array)
    ], LocationComponent.prototype, "userRoles", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], LocationComponent.prototype, "onClick", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], LocationComponent.prototype, "onManage", void 0);
    LocationComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-location',
            template: __webpack_require__(/*! ./location.component.html */ "./src/app/reserve/components/locations/location/location.component.html"),
            styles: [__webpack_require__(/*! ./location.component.scss */ "./src/app/reserve/components/locations/location/location.component.scss")]
        })
    ], LocationComponent);
    return LocationComponent;
}());



/***/ }),

/***/ "./src/app/reserve/components/locations/locations.component.html":
/*!***********************************************************************!*\
  !*** ./src/app/reserve/components/locations/locations.component.html ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!-- show if data loading initally or evaluating geolocationDeclined\nunless pulling to refresh (so we don't show duplicate spinners) -->\n<ion-row *ngIf=\"((isLoading$ | async) || evaluatingGeolocation) && !reserveService.isRefreshing\" margin-vertical>\n  <ion-spinner name=\"crescent\" class=\"center\"></ion-spinner>\n</ion-row>\n\n<section>\n  <section\n    class=\"ion-text-center\"\n    padding\n    *ngIf=\"(askForGeolocation$ | async) && !evaluatingGeolocation; else showLocations\"\n  >\n    <ion-icon name=\"pin\" class=\"location\"></ion-icon>\n    <p>\n      Clicker needs access to your location for more accurate location details. This data is not stored or shared.\n    </p>\n    <div><ion-button margin-top (click)=\"allowLocation()\">Allow Location Access </ion-button></div>\n  </section>\n\n  <ng-template #showLocations>\n    <ion-list lines=\"none\" [class.content-loading]=\"(isLoading$ | async) || waiting\">\n      <ng-container *ngFor=\"let location of locations$ | async | locationsFilter: searchTerm\">\n        <app-location\n          [location]=\"location\"\n          [userRoles]=\"userRoles\"\n          [userLocations]=\"userLocations\"\n          (onClick)=\"onLocationClick($event)\"\n          (onManage)=\"onLocationManage($event)\"\n        ></app-location>\n      </ng-container>\n      <p *ngIf=\"geolocationDeclined && !evaluatingGeolocation\" class=\"ion-text-center\" padding>\n        Find locations around you by <a (click)=\"forceAllow()\">allowing location services</a>\n      </p>\n    </ion-list>\n  </ng-template>\n</section>\n"

/***/ }),

/***/ "./src/app/reserve/components/locations/locations.component.scss":
/*!***********************************************************************!*\
  !*** ./src/app/reserve/components/locations/locations.component.scss ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "ion-icon.location {\n  color: var(--ion-color-primary);\n  font-size: 64px; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aW1naWJsaW4vQ29kZS9jbGlja2VyL21vYmlsZS9hcHAvc3JjL2FwcC9yZXNlcnZlL2NvbXBvbmVudHMvbG9jYXRpb25zL2xvY2F0aW9ucy5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLCtCQUErQjtFQUMvQixlQUFlLEVBQUEiLCJmaWxlIjoic3JjL2FwcC9yZXNlcnZlL2NvbXBvbmVudHMvbG9jYXRpb25zL2xvY2F0aW9ucy5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbImlvbi1pY29uLmxvY2F0aW9uIHtcbiAgY29sb3I6IHZhcigtLWlvbi1jb2xvci1wcmltYXJ5KTtcbiAgZm9udC1zaXplOiA2NHB4O1xufVxuIl19 */"

/***/ }),

/***/ "./src/app/reserve/components/locations/locations.component.ts":
/*!*********************************************************************!*\
  !*** ./src/app/reserve/components/locations/locations.component.ts ***!
  \*********************************************************************/
/*! exports provided: LocationsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LocationsComponent", function() { return LocationsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _reserve_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../reserve.service */ "./src/app/reserve/reserve.service.ts");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var src_app_state_location__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/state/location */ "./src/app/state/location/index.ts");
/* harmony import */ var src_app_state_user__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/state/user */ "./src/app/state/user/index.ts");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var _state_location_location_actions__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../state/location/location.actions */ "./src/app/state/location/location.actions.ts");
/* harmony import */ var _state_user_user_actions__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../state/user/user.actions */ "./src/app/state/user/user.actions.ts");
/* harmony import */ var _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../state/reservation/reservation.actions */ "./src/app/state/reservation/reservation.actions.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _ngrx_effects__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @ngrx/effects */ "./node_modules/@ngrx/effects/fesm5/effects.js");
/* harmony import */ var _capacitor_core__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @capacitor/core */ "./node_modules/@capacitor/core/dist/esm/index.js");
/* harmony import */ var _ionic_storage__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @ionic/storage */ "./node_modules/@ionic/storage/fesm5/ionic-storage.js");
/* harmony import */ var ngx_segment_analytics__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ngx-segment-analytics */ "./node_modules/ngx-segment-analytics/index.js");
/* harmony import */ var src_app_globals__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! src/app/globals */ "./src/app/globals.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};














var Geolocation = _capacitor_core__WEBPACK_IMPORTED_MODULE_13__["Plugins"].Geolocation;



var permissionGeolocation = {
    name: 'permission.geolocation',
    values: {
        allowed: 'allowed',
        probably: 'probably',
        denied: 'denied',
    },
};
var LocationsComponent = /** @class */ (function () {
    function LocationsComponent(store, actionSheetController, toastController, reserveService, router, route, navCtrl, actions$, storage, segment, globals) {
        var _this = this;
        this.store = store;
        this.actionSheetController = actionSheetController;
        this.toastController = toastController;
        this.reserveService = reserveService;
        this.router = router;
        this.route = route;
        this.navCtrl = navCtrl;
        this.actions$ = actions$;
        this.storage = storage;
        this.segment = segment;
        this.globals = globals;
        this.title = 'Choose Location';
        this.askForGeolocation$ = new rxjs__WEBPACK_IMPORTED_MODULE_2__["BehaviorSubject"](true);
        this.evaluatingGeolocation = true;
        this.geolocationDeclined = true;
        this.locations$ = this.store.select(src_app_state_location__WEBPACK_IMPORTED_MODULE_3__["getAllLocations"]);
        this.reserveService.emitTitle(this.title);
        this.refreshSubscription = this.reserveService.refreshEmitted$.subscribe(function () { return _this.refresh(); });
    }
    LocationsComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.redirectIfUpdating();
                this.evaluateGeolocation();
                this.isLoading$ = this.store.select(src_app_state_location__WEBPACK_IMPORTED_MODULE_3__["getLoading"]);
                this.userLocations$ = this.store.select(src_app_state_user__WEBPACK_IMPORTED_MODULE_4__["getUserLocations"]);
                this.userLocations$.pipe().subscribe(function (userLocations) {
                    _this.userLocations = userLocations;
                });
                this.userRoles$ = this.store.select(src_app_state_user__WEBPACK_IMPORTED_MODULE_4__["getUserRoles"]);
                this.userRoles$.pipe().subscribe(function (userRoles) {
                    _this.userRoles = userRoles;
                });
                this.searchSubscription = this.reserveService.searchTermEmitted$.subscribe(function (searchTerm) {
                    _this.searchTerm = searchTerm;
                });
                this.closeSearchSubscription = this.reserveService.closeSearchEmitted$.subscribe(function () {
                    _this.searchTerm = null;
                });
                return [2 /*return*/];
            });
        });
    };
    LocationsComponent.prototype.ngOnDestroy = function () {
        this.refreshSubscription.unsubscribe();
        this.searchSubscription.unsubscribe();
        this.closeSearchSubscription.unsubscribe();
    };
    LocationsComponent.prototype.redirectIfUpdating = function () {
        return __awaiter(this, void 0, void 0, function () {
            var state, reservation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.store.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_11__["first"])()).toPromise()];
                    case 1:
                        state = _a.sent();
                        reservation = state.reservation.reservation;
                        // check if editing existing reservation
                        if (reservation && reservation.id) {
                            // is editing
                            if (!reservation.program) {
                                this.navCtrl.navigateForward(['../programs'], {
                                    relativeTo: this.route,
                                    queryParamsHandling: 'merge',
                                });
                            }
                            else {
                                this.navCtrl.navigateForward(['../confirmation'], {
                                    relativeTo: this.route,
                                    queryParamsHandling: 'merge',
                                });
                            }
                        }
                        else {
                            this.store.dispatch(new _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_8__["Start"]());
                            this.segment.track(this.globals.events.reservation.started);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LocationsComponent.prototype.refresh = function () {
        var _this = this;
        this.store.dispatch(new _state_location_location_actions__WEBPACK_IMPORTED_MODULE_6__["GetAll"](this.userGeolocation));
        this.store.dispatch(new _state_user_user_actions__WEBPACK_IMPORTED_MODULE_7__["Refresh"]());
        this.actions$
            .pipe(Object(_ngrx_effects__WEBPACK_IMPORTED_MODULE_12__["ofType"])(_state_location_location_actions__WEBPACK_IMPORTED_MODULE_6__["GET_ALL_LOCATIONS_SUCCESS"]), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_11__["take"])(1))
            .subscribe(function () {
            _this.reserveService.emitRefreshed();
        });
        this.actions$
            .pipe(Object(_ngrx_effects__WEBPACK_IMPORTED_MODULE_12__["ofType"])(_state_location_location_actions__WEBPACK_IMPORTED_MODULE_6__["GET_ALL_LOCATIONS_FAIL"]))
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_11__["first"])())
            .subscribe(function () { return __awaiter(_this, void 0, void 0, function () {
            var whoops;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.toastController.create({
                            message: 'Something went wrong. Please try again.',
                            color: 'danger',
                            duration: 4000,
                            cssClass: 'ion-text-center',
                        })];
                    case 1:
                        whoops = _a.sent();
                        whoops.present();
                        this.reserveService.emitRefreshed();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    LocationsComponent.prototype.allowLocation = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.set(permissionGeolocation.name, permissionGeolocation.values.probably)];
                    case 1:
                        _a.sent();
                        this.evaluateGeolocation();
                        this.segment.track(this.globals.events.permissions.geolocation.allowed);
                        return [2 /*return*/];
                }
            });
        });
    };
    LocationsComponent.prototype.denyLocation = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.set(permissionGeolocation.name, permissionGeolocation.values.denied)];
                    case 1:
                        _a.sent();
                        this.askForGeolocation$.next(false);
                        this.evaluateGeolocation();
                        this.segment.track(this.globals.events.permissions.geolocation.denied);
                        return [2 /*return*/];
                }
            });
        });
    };
    LocationsComponent.prototype.onLocationManage = function (location) {
        return __awaiter(this, void 0, void 0, function () {
            var actionSheet;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.actionSheetController.create({
                            header: 'Manage Location',
                            buttons: [
                                {
                                    text: 'Turn off all TVs',
                                    icon: 'power',
                                    cssClass: 'color-danger',
                                    handler: function () {
                                        _this.store.dispatch(new _state_location_location_actions__WEBPACK_IMPORTED_MODULE_6__["TurnOff"](location));
                                    },
                                },
                                {
                                    text: 'Turn on all TVs',
                                    icon: 'power',
                                    cssClass: 'color-success',
                                    handler: function () {
                                        _this.store.dispatch(new _state_location_location_actions__WEBPACK_IMPORTED_MODULE_6__["TurnOn"](location));
                                    },
                                },
                                {
                                    text: 'Turn on all TVs + autotune',
                                    icon: 'power',
                                    cssClass: 'color-success',
                                    handler: function () {
                                        _this.store.dispatch(new _state_location_location_actions__WEBPACK_IMPORTED_MODULE_6__["TurnOn"](location, true));
                                    },
                                },
                            ],
                        })];
                    case 1:
                        actionSheet = _a.sent();
                        return [4 /*yield*/, actionSheet.present()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LocationsComponent.prototype.evaluateGeolocation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var permissionStatus;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.get(permissionGeolocation.name)];
                    case 1:
                        permissionStatus = _a.sent();
                        if (!(permissionStatus &&
                            (permissionStatus === permissionGeolocation.values.allowed ||
                                permissionStatus === permissionGeolocation.values.probably))) return [3 /*break*/, 3];
                        return [4 /*yield*/, Geolocation.getCurrentPosition()
                                .then(function (response) {
                                _this.askForGeolocation$.next(false);
                                _this.evaluatingGeolocation = false;
                                _this.geolocationDeclined = false;
                                _this.storage.set(permissionGeolocation.name, permissionGeolocation.values.allowed);
                                var _a = response.coords, latitude = _a.latitude, longitude = _a.longitude;
                                _this.userGeolocation = { latitude: latitude, longitude: longitude };
                                _this.store.dispatch(new _state_location_location_actions__WEBPACK_IMPORTED_MODULE_6__["GetAll"](_this.userGeolocation));
                                _this.reserveService.emitShowingLocations();
                            })
                                .catch(function (error) { return __awaiter(_this, void 0, void 0, function () {
                                var whoops;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            this.evaluatingGeolocation = false;
                                            this.askForGeolocation$.next(false);
                                            this.store.dispatch(new _state_location_location_actions__WEBPACK_IMPORTED_MODULE_6__["GetAll"](this.userGeolocation));
                                            this.reserveService.emitShowingLocations();
                                            console.error('Error getting location', error);
                                            return [4 /*yield*/, this.toastController.create({
                                                    message: 'You need to allow location services in your phone settings for this app.',
                                                    color: 'light',
                                                    duration: 6000,
                                                    cssClass: 'ion-text-center',
                                                })];
                                        case 1:
                                            whoops = _a.sent();
                                            whoops.present();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        if (permissionStatus === permissionGeolocation.values.denied) {
                            this.askForGeolocation$.next(false);
                            this.evaluatingGeolocation = false;
                            this.reserveService.emitShowingLocations();
                            this.store.dispatch(new _state_location_location_actions__WEBPACK_IMPORTED_MODULE_6__["GetAll"]());
                        }
                        else {
                            this.askForGeolocation$.next(true);
                            this.evaluatingGeolocation = false;
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LocationsComponent.prototype.forceAllow = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.remove(permissionGeolocation.name)];
                    case 1:
                        _a.sent();
                        location.reload();
                        return [2 /*return*/];
                }
            });
        });
    };
    LocationsComponent.prototype.onLocationClick = function (location) {
        var _this = this;
        this.waiting = true;
        this.reserveService.emitCloseSearch();
        this.store.dispatch(new _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_8__["SetLocation"](location));
        this.actions$
            .pipe(Object(_ngrx_effects__WEBPACK_IMPORTED_MODULE_12__["ofType"])(_state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_8__["SET_RESERVATION_LOCATION_SUCCESS"]))
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_11__["first"])())
            .subscribe(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.router.navigate(['../programs'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return [2 /*return*/];
            });
        }); });
    };
    LocationsComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            template: __webpack_require__(/*! ./locations.component.html */ "./src/app/reserve/components/locations/locations.component.html"),
            styles: [__webpack_require__(/*! ./locations.component.scss */ "./src/app/reserve/components/locations/locations.component.scss")]
        }),
        __metadata("design:paramtypes", [_ngrx_store__WEBPACK_IMPORTED_MODULE_5__["Store"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_10__["ActionSheetController"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_10__["ToastController"],
            _reserve_service__WEBPACK_IMPORTED_MODULE_1__["ReserveService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_9__["Router"],
            _angular_router__WEBPACK_IMPORTED_MODULE_9__["ActivatedRoute"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_10__["NavController"],
            _ngrx_effects__WEBPACK_IMPORTED_MODULE_12__["Actions"],
            _ionic_storage__WEBPACK_IMPORTED_MODULE_14__["Storage"],
            ngx_segment_analytics__WEBPACK_IMPORTED_MODULE_15__["SegmentService"],
            src_app_globals__WEBPACK_IMPORTED_MODULE_16__["Globals"]])
    ], LocationsComponent);
    return LocationsComponent;
}());



/***/ }),

/***/ "./src/app/reserve/components/programs/info/info.component.html":
/*!**********************************************************************!*\
  !*** ./src/app/reserve/components/programs/info/info.component.html ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-header>\n  <ion-toolbar>\n    <ion-title> Program Info </ion-title>\n    <ion-buttons slot=\"end\">\n      <ion-button (click)=\"onCloseClick()\"> <ion-icon slot=\"icon-only\" name=\"close\"></ion-icon> </ion-button>\n    </ion-buttons>\n  </ion-toolbar>\n</ion-header>\n<ion-content padding>\n  <label>Title</label>\n  <div>\n    <span> {{ program.title }}</span>\n  </div>\n  <br />\n  <label>Description</label>\n  <div>\n    <span *ngIf=\"program.description; else noDescription\"> {{ program.description }}</span>\n    <ng-template #noDescription>No description available</ng-template>\n  </div>\n</ion-content>\n"

/***/ }),

/***/ "./src/app/reserve/components/programs/info/info.component.scss":
/*!**********************************************************************!*\
  !*** ./src/app/reserve/components/programs/info/info.component.scss ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "label {\n  font-weight: bold; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aW1naWJsaW4vQ29kZS9jbGlja2VyL21vYmlsZS9hcHAvc3JjL2FwcC9yZXNlcnZlL2NvbXBvbmVudHMvcHJvZ3JhbXMvaW5mby9pbmZvLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsaUJBQWlCLEVBQUEiLCJmaWxlIjoic3JjL2FwcC9yZXNlcnZlL2NvbXBvbmVudHMvcHJvZ3JhbXMvaW5mby9pbmZvLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsibGFiZWwge1xuICBmb250LXdlaWdodDogYm9sZDtcbn1cbiJdfQ== */"

/***/ }),

/***/ "./src/app/reserve/components/programs/info/info.component.ts":
/*!********************************************************************!*\
  !*** ./src/app/reserve/components/programs/info/info.component.ts ***!
  \********************************************************************/
/*! exports provided: InfoComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InfoComponent", function() { return InfoComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var InfoComponent = /** @class */ (function () {
    function InfoComponent(modalController) {
        this.modalController = modalController;
    }
    InfoComponent.prototype.onCloseClick = function () {
        this.modalController.dismiss();
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], InfoComponent.prototype, "program", void 0);
    InfoComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-info',
            template: __webpack_require__(/*! ./info.component.html */ "./src/app/reserve/components/programs/info/info.component.html"),
            styles: [__webpack_require__(/*! ./info.component.scss */ "./src/app/reserve/components/programs/info/info.component.scss")]
        }),
        __metadata("design:paramtypes", [_ionic_angular__WEBPACK_IMPORTED_MODULE_1__["ModalController"]])
    ], InfoComponent);
    return InfoComponent;
}());



/***/ }),

/***/ "./src/app/reserve/components/programs/program/program.component.html":
/*!****************************************************************************!*\
  !*** ./src/app/reserve/components/programs/program/program.component.html ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-item-sliding [disabled]=\"false\" #slidingItem>\n  <ion-item-options side=\"start\">\n    <ion-item-option (click)=\"onMoreInfo(slidingItem)\">Info</ion-item-option>\n  </ion-item-options>\n  <ion-item>\n    <ion-card (click)=\"onProgramClick()\" no-margin>\n      <ion-card-header>\n        <ion-card-subtitle>\n          <span>{{ program.channelTitle }}</span>\n          <span float-right\n            >{{ program.start | amDateFormat: 'h:mma' }} - {{ program.end | amDateFormat: 'h:mma' }}</span\n          >\n        </ion-card-subtitle>\n      </ion-card-header>\n      <ion-card-content no-padding-top>\n        <ion-grid no-padding>\n          <ion-row align-items-center>\n            <ng-container *ngIf=\"program.start; else noProgram\">\n              <ion-col size=\"1\" no-padding align-items-center>\n                <ion-icon [name]=\"program.icon\" class=\"sport {{ program.icon }}\" size=\"large\" fill=\"red\"></ion-icon>\n              </ion-col>\n              <ion-col size=\"11\">\n                <h1 class=\"title\">\n                  {{ program.title }} <span class=\"faded\" *ngIf=\"isReplay()\">(Replay)</span\n                  ><ion-icon *ngIf=\"program.points >= 5\" name=\"flame\" class=\"trending\"></ion-icon>\n                </h1>\n              </ion-col>\n\n              <ion-col size=\"12\">\n                <span class=\"faded\" *ngIf=\"program.nextProgramTitle\">\n                  Next: {{ getNextProgramTitle() }} at {{ program.nextProgramStart | amDateFormat: 'h:mma' }}\n                </span>\n              </ion-col>\n            </ng-container>\n            <ng-template #noProgram> &nbsp;</ng-template>\n          </ion-row>\n        </ion-grid>\n      </ion-card-content>\n    </ion-card>\n  </ion-item>\n</ion-item-sliding>\n"

/***/ }),

/***/ "./src/app/reserve/components/programs/program/program.component.scss":
/*!****************************************************************************!*\
  !*** ./src/app/reserve/components/programs/program/program.component.scss ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "ion-icon.sport {\n  display: inline; }\n  ion-icon.sport.baseball {\n    color: #cf665b; }\n  ion-icon.sport.basketball {\n    color: #e69f4e; }\n  ion-icon.sport.american-football {\n    color: #795548; }\n  ion-icon.sport.football {\n    color: #212121; }\n  ion-icon.sport.tv {\n    color: #607d8b; }\n  ion-icon.trending {\n  color: #e65100; }\n  .title {\n  padding-left: 10px; }\n  .faded {\n  opacity: 0.45; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aW1naWJsaW4vQ29kZS9jbGlja2VyL21vYmlsZS9hcHAvc3JjL2FwcC9yZXNlcnZlL2NvbXBvbmVudHMvcHJvZ3JhbXMvcHJvZ3JhbS9wcm9ncmFtLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBRUUsZUFBZSxFQUFBO0VBRmpCO0lBSUksY0FBYyxFQUFBO0VBSmxCO0lBT0ksY0FBYyxFQUFBO0VBUGxCO0lBVUksY0FBYyxFQUFBO0VBVmxCO0lBYUksY0FBYyxFQUFBO0VBYmxCO0lBZ0JJLGNBQWMsRUFBQTtFQUlsQjtFQUNFLGNBQWMsRUFBQTtFQUdoQjtFQUNFLGtCQUFrQixFQUFBO0VBR3BCO0VBQ0UsYUFBYSxFQUFBIiwiZmlsZSI6InNyYy9hcHAvcmVzZXJ2ZS9jb21wb25lbnRzL3Byb2dyYW1zL3Byb2dyYW0vcHJvZ3JhbS5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbImlvbi1pY29uLnNwb3J0IHtcbiAgLy8gcGFkZGluZzogMCAxMHB4IDAgMDtcbiAgZGlzcGxheTogaW5saW5lO1xuICAmLmJhc2ViYWxsIHtcbiAgICBjb2xvcjogI2NmNjY1YjtcbiAgfVxuICAmLmJhc2tldGJhbGwge1xuICAgIGNvbG9yOiAjZTY5ZjRlO1xuICB9XG4gICYuYW1lcmljYW4tZm9vdGJhbGwge1xuICAgIGNvbG9yOiAjNzk1NTQ4O1xuICB9XG4gICYuZm9vdGJhbGwge1xuICAgIGNvbG9yOiAjMjEyMTIxO1xuICB9XG4gICYudHYge1xuICAgIGNvbG9yOiAjNjA3ZDhiO1xuICB9XG59XG5cbmlvbi1pY29uLnRyZW5kaW5nIHtcbiAgY29sb3I6ICNlNjUxMDA7XG59XG5cbi50aXRsZSB7XG4gIHBhZGRpbmctbGVmdDogMTBweDtcbn1cblxuLmZhZGVkIHtcbiAgb3BhY2l0eTogMC40NTtcbn1cbiJdfQ== */"

/***/ }),

/***/ "./src/app/reserve/components/programs/program/program.component.ts":
/*!**************************************************************************!*\
  !*** ./src/app/reserve/components/programs/program/program.component.ts ***!
  \**************************************************************************/
/*! exports provided: ProgramComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ProgramComponent", function() { return ProgramComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

var ProgramComponent = /** @class */ (function () {
    function ProgramComponent() {
        this.onSelect = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
        this.onInfo = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    ProgramComponent.prototype.onProgramClick = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.onSelect.emit(this.program);
                return [2 /*return*/];
            });
        });
    };
    ProgramComponent.prototype.isReplay = function () {
        var isSport = this.program.title.indexOf(' @ ') > -1 || this.program.title.indexOf(' at ') > -1;
        if (this.program.repeat && isSport) {
            return true;
        }
    };
    ProgramComponent.prototype.getNextProgramTitle = function () {
        var maxLength = 25;
        var nextProgramTitle = this.program.nextProgramTitle;
        if (nextProgramTitle) {
            if (nextProgramTitle.length < maxLength) {
                return nextProgramTitle;
            }
            else {
                return nextProgramTitle.substring(0, maxLength - 3) + '...';
            }
        }
    };
    ProgramComponent.prototype.onMoreInfo = function (slidingItem) {
        console.log('onMoreInfo click');
        this.onInfo.emit(this.program);
        slidingItem.close();
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], ProgramComponent.prototype, "program", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], ProgramComponent.prototype, "onSelect", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", Object)
    ], ProgramComponent.prototype, "onInfo", void 0);
    ProgramComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-program',
            template: __webpack_require__(/*! ./program.component.html */ "./src/app/reserve/components/programs/program/program.component.html"),
            styles: [__webpack_require__(/*! ./program.component.scss */ "./src/app/reserve/components/programs/program/program.component.scss")]
        }),
        __metadata("design:paramtypes", [])
    ], ProgramComponent);
    return ProgramComponent;
}());



/***/ }),

/***/ "./src/app/reserve/components/programs/programs.component.html":
/*!*********************************************************************!*\
  !*** ./src/app/reserve/components/programs/programs.component.html ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-row *ngIf=\"(isLoading$ | async) && !reserveService.isRefreshing\" margin-vertical>\n  <ion-spinner name=\"crescent\" class=\"center\"></ion-spinner>\n</ion-row>\n<ion-list lines=\"none\" [class.content-loading]=\"isLoading$ | async\">\n  <app-program\n    *ngFor=\"let program of (programs$ | async | programsFilter: searchTerm)\"\n    (onSelect)=\"onProgramSelect($event)\"\n    (onInfo)=\"onProgramInfo($event)\"\n    [program]=\"program\"\n  ></app-program>\n</ion-list>\n"

/***/ }),

/***/ "./src/app/reserve/components/programs/programs.component.scss":
/*!*********************************************************************!*\
  !*** ./src/app/reserve/components/programs/programs.component.scss ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3Jlc2VydmUvY29tcG9uZW50cy9wcm9ncmFtcy9wcm9ncmFtcy5jb21wb25lbnQuc2NzcyJ9 */"

/***/ }),

/***/ "./src/app/reserve/components/programs/programs.component.ts":
/*!*******************************************************************!*\
  !*** ./src/app/reserve/components/programs/programs.component.ts ***!
  \*******************************************************************/
/*! exports provided: ProgramsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ProgramsComponent", function() { return ProgramsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var src_app_state_program__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/state/program */ "./src/app/state/program/index.ts");
/* harmony import */ var src_app_state_reservation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/state/reservation */ "./src/app/state/reservation/index.ts");
/* harmony import */ var _state_program_program_actions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../state/program/program.actions */ "./src/app/state/program/program.actions.ts");
/* harmony import */ var _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../state/reservation/reservation.actions */ "./src/app/state/reservation/reservation.actions.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _reserve_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../reserve.service */ "./src/app/reserve/reserve.service.ts");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _ngrx_effects__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @ngrx/effects */ "./node_modules/@ngrx/effects/fesm5/effects.js");
/* harmony import */ var _info_info_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./info/info.component */ "./src/app/reserve/components/programs/info/info.component.ts");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};












var ProgramsComponent = /** @class */ (function () {
    function ProgramsComponent(store, reserveService, modalController, toastController, router, route, actions$) {
        var _this = this;
        this.store = store;
        this.reserveService = reserveService;
        this.modalController = modalController;
        this.toastController = toastController;
        this.router = router;
        this.route = route;
        this.actions$ = actions$;
        this.title = 'Choose Channel';
        this.programs$ = this.store.select(src_app_state_program__WEBPACK_IMPORTED_MODULE_2__["getAllPrograms"]);
        this.reservation$ = this.store.select(src_app_state_reservation__WEBPACK_IMPORTED_MODULE_3__["getReservation"]);
        this.reserveService.emitTitle(this.title);
        this.searchSubscription = this.reserveService.searchTermEmitted$.subscribe(function (searchTerm) {
            _this.searchTerm = searchTerm;
        });
        this.closeSearchSubscription = this.reserveService.closeSearchEmitted$.subscribe(function () {
            _this.searchTerm = null;
        });
        this.refreshSubscription = this.reserveService.refreshEmitted$.subscribe(function () { return _this.refresh(); });
    }
    ProgramsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoading$ = this.store.select(src_app_state_program__WEBPACK_IMPORTED_MODULE_2__["getLoading"]);
        this.reservation$
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_8__["first"])())
            .subscribe(function (reservation) { return _this.store.dispatch(new _state_program_program_actions__WEBPACK_IMPORTED_MODULE_4__["GetAllByLocation"](reservation.location)); });
    };
    ProgramsComponent.prototype.refresh = function () {
        var _this = this;
        this.reservation$
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_8__["first"])())
            .subscribe(function (reservation) { return _this.store.dispatch(new _state_program_program_actions__WEBPACK_IMPORTED_MODULE_4__["GetAllByLocation"](reservation.location)); });
        this.actions$
            .pipe(Object(_ngrx_effects__WEBPACK_IMPORTED_MODULE_9__["ofType"])(_state_program_program_actions__WEBPACK_IMPORTED_MODULE_4__["GET_PROGRAMS_SUCCESS"]))
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_8__["first"])())
            .subscribe(function () {
            _this.reserveService.emitRefreshed();
        });
        this.actions$
            .pipe(Object(_ngrx_effects__WEBPACK_IMPORTED_MODULE_9__["ofType"])(_state_program_program_actions__WEBPACK_IMPORTED_MODULE_4__["GET_PROGRAMS_FAIL"]))
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_8__["first"])())
            .subscribe(function () { return __awaiter(_this, void 0, void 0, function () {
            var whoops;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.toastController.create({
                            message: 'Something went wrong. Please try again.',
                            color: 'danger',
                            duration: 4000,
                            cssClass: 'ion-text-center',
                        })];
                    case 1:
                        whoops = _a.sent();
                        whoops.present();
                        this.reserveService.emitRefreshed();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    ProgramsComponent.prototype.ngOnDestroy = function () {
        this.refreshSubscription.unsubscribe();
        this.searchSubscription.unsubscribe();
        this.closeSearchSubscription.unsubscribe();
    };
    ProgramsComponent.prototype.onProgramSelect = function (program) {
        return __awaiter(this, void 0, void 0, function () {
            var state, reservation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.reserveService.emitCloseSearch();
                        this.store.dispatch(new _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_5__["SetProgram"](program));
                        return [4 /*yield*/, this.store.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_8__["first"])()).toPromise()];
                    case 1:
                        state = _a.sent();
                        reservation = state.reservation.reservation;
                        if (reservation.id && reservation.box && reservation.box.label) {
                            this.router.navigate(['../confirmation'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                        }
                        else {
                            this.router.navigate(['../tvs'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ProgramsComponent.prototype.onProgramInfo = function (program) {
        return __awaiter(this, void 0, void 0, function () {
            var modal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('onProgramInfo event caught');
                        return [4 /*yield*/, this.modalController.create({
                                component: _info_info_component__WEBPACK_IMPORTED_MODULE_10__["InfoComponent"],
                                componentProps: { program: program },
                            })];
                    case 1:
                        modal = _a.sent();
                        modal.present();
                        return [2 /*return*/];
                }
            });
        });
    };
    ProgramsComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            template: __webpack_require__(/*! ./programs.component.html */ "./src/app/reserve/components/programs/programs.component.html"),
            styles: [__webpack_require__(/*! ./programs.component.scss */ "./src/app/reserve/components/programs/programs.component.scss")]
        }),
        __metadata("design:paramtypes", [_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["Store"],
            _reserve_service__WEBPACK_IMPORTED_MODULE_7__["ReserveService"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_11__["ModalController"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_11__["ToastController"],
            _angular_router__WEBPACK_IMPORTED_MODULE_6__["Router"],
            _angular_router__WEBPACK_IMPORTED_MODULE_6__["ActivatedRoute"],
            _ngrx_effects__WEBPACK_IMPORTED_MODULE_9__["Actions"]])
    ], ProgramsComponent);
    return ProgramsComponent;
}());



/***/ }),

/***/ "./src/app/reserve/components/tvs/tvs.component.html":
/*!***********************************************************!*\
  !*** ./src/app/reserve/components/tvs/tvs.component.html ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-row *ngIf=\"(isLoading$ | async) && !reserveService.isRefreshing\" margin-vertical>\n  <ion-spinner name=\"crescent\" class=\"center\"></ion-spinner>\n</ion-row>\n<ion-row [class.content-loading]=\"isLoading$ | async\">\n  <ion-col *ngFor=\"let tv of (tvs$ | async)\" size=\"4\">\n    <ion-button\n      color=\"light\"\n      size=\"large\"\n      expand=\"block\"\n      (click)=\"onTvClick(tv)\"\n      [ngClass]=\"{ reserved: tv.reserved }\"\n      >{{ tv.label }}</ion-button\n    >\n  </ion-col>\n</ion-row>\n"

/***/ }),

/***/ "./src/app/reserve/components/tvs/tvs.component.scss":
/*!***********************************************************!*\
  !*** ./src/app/reserve/components/tvs/tvs.component.scss ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".reserved {\n  opacity: 0.3; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aW1naWJsaW4vQ29kZS9jbGlja2VyL21vYmlsZS9hcHAvc3JjL2FwcC9yZXNlcnZlL2NvbXBvbmVudHMvdHZzL3R2cy5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLFlBQVksRUFBQSIsImZpbGUiOiJzcmMvYXBwL3Jlc2VydmUvY29tcG9uZW50cy90dnMvdHZzLmNvbXBvbmVudC5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLnJlc2VydmVkIHtcbiAgb3BhY2l0eTogMC4zO1xufVxuIl19 */"

/***/ }),

/***/ "./src/app/reserve/components/tvs/tvs.component.ts":
/*!*********************************************************!*\
  !*** ./src/app/reserve/components/tvs/tvs.component.ts ***!
  \*********************************************************/
/*! exports provided: TvsComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TvsComponent", function() { return TvsComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var _reserve_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../reserve.service */ "./src/app/reserve/reserve.service.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../state/reservation/reservation.actions */ "./src/app/state/reservation/reservation.actions.ts");
/* harmony import */ var src_app_state_reservation__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/app/state/reservation */ "./src/app/state/reservation/index.ts");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _ngrx_effects__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @ngrx/effects */ "./node_modules/@ngrx/effects/fesm5/effects.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var src_app_state_location__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! src/app/state/location */ "./src/app/state/location/index.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};











var TvsComponent = /** @class */ (function () {
    function TvsComponent(store, reserveService, router, route, toastController, actions$) {
        var _this = this;
        this.store = store;
        this.reserveService = reserveService;
        this.router = router;
        this.route = route;
        this.toastController = toastController;
        this.actions$ = actions$;
        this.title = 'Choose TV';
        this.tvs$ = this.store.select(src_app_state_reservation__WEBPACK_IMPORTED_MODULE_5__["getReservationTvs"]);
        this.reservation$ = this.store.select(src_app_state_reservation__WEBPACK_IMPORTED_MODULE_5__["getReservation"]);
        this.reservation$.subscribe(function (r) { return (_this.reservation = r); });
        this.reserveService.emitTitle(this.title);
        this.refreshSubscription = this.reserveService.refreshEmitted$.subscribe(function () { return _this.refresh(); });
    }
    TvsComponent.prototype.ngOnInit = function () {
        this.isLoading$ = this.store.select(src_app_state_location__WEBPACK_IMPORTED_MODULE_10__["getLoading"]);
    };
    TvsComponent.prototype.ngOnDestroy = function () {
        this.refreshSubscription.unsubscribe();
    };
    TvsComponent.prototype.onTvClick = function (tv) {
        return __awaiter(this, void 0, void 0, function () {
            var toast;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!tv.reserved) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.toastController.create({
                                message: tv.label + " is reserved until " + moment__WEBPACK_IMPORTED_MODULE_7__(tv.end).format('h:mma'),
                                duration: 2000,
                                cssClass: 'ion-text-center',
                            })];
                    case 1:
                        toast = _a.sent();
                        return [2 /*return*/, toast.present()];
                    case 2:
                        this.store.dispatch(new _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_4__["SetTv"](tv));
                        this.router.navigate(['../confirmation'], { relativeTo: this.route });
                        return [2 /*return*/];
                }
            });
        });
    };
    TvsComponent.prototype.refresh = function () {
        var _this = this;
        this.store.dispatch(new _state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_4__["SetLocation"](this.reservation.location));
        this.actions$
            .pipe(Object(_ngrx_effects__WEBPACK_IMPORTED_MODULE_8__["ofType"])(_state_reservation_reservation_actions__WEBPACK_IMPORTED_MODULE_4__["SET_RESERVATION_LOCATION_SUCCESS"]))
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_9__["first"])())
            .subscribe(function () {
            _this.reserveService.emitRefreshed();
        });
    };
    TvsComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-tvs',
            template: __webpack_require__(/*! ./tvs.component.html */ "./src/app/reserve/components/tvs/tvs.component.html"),
            styles: [__webpack_require__(/*! ./tvs.component.scss */ "./src/app/reserve/components/tvs/tvs.component.scss")]
        }),
        __metadata("design:paramtypes", [_ngrx_store__WEBPACK_IMPORTED_MODULE_1__["Store"],
            _reserve_service__WEBPACK_IMPORTED_MODULE_2__["ReserveService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"],
            _angular_router__WEBPACK_IMPORTED_MODULE_3__["ActivatedRoute"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_6__["ToastController"],
            _ngrx_effects__WEBPACK_IMPORTED_MODULE_8__["Actions"]])
    ], TvsComponent);
    return TvsComponent;
}());



/***/ }),

/***/ "./src/app/reserve/pipes/locations-filter.pipe.ts":
/*!********************************************************!*\
  !*** ./src/app/reserve/pipes/locations-filter.pipe.ts ***!
  \********************************************************/
/*! exports provided: LocationsFilterPipe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LocationsFilterPipe", function() { return LocationsFilterPipe; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var LocationsFilterPipe = /** @class */ (function () {
    function LocationsFilterPipe() {
    }
    LocationsFilterPipe.prototype.transform = function (locations, searchText) {
        if (!locations)
            return [];
        if (!searchText)
            return locations;
        searchText = searchText.toLowerCase();
        return locations.filter(function (p) {
            return p.name.toLowerCase().includes(searchText) || p.neighborhood.toLowerCase().includes(searchText);
        });
    };
    LocationsFilterPipe = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Pipe"])({
            name: 'locationsFilter',
        })
    ], LocationsFilterPipe);
    return LocationsFilterPipe;
}());



/***/ }),

/***/ "./src/app/reserve/pipes/programs-filter.pipe.ts":
/*!*******************************************************!*\
  !*** ./src/app/reserve/pipes/programs-filter.pipe.ts ***!
  \*******************************************************/
/*! exports provided: ProgramsFilterPipe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ProgramsFilterPipe", function() { return ProgramsFilterPipe; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var ProgramsFilterPipe = /** @class */ (function () {
    function ProgramsFilterPipe() {
    }
    ProgramsFilterPipe.prototype.transform = function (programs, searchText) {
        if (!programs)
            return [];
        if (!searchText)
            return programs;
        searchText = searchText.toLowerCase();
        return programs.filter(function (p) {
            return (p.channelTitle.toLowerCase().includes(searchText) || (p.title && p.title.toLowerCase().includes(searchText)));
        });
    };
    ProgramsFilterPipe = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Pipe"])({
            name: 'programsFilter',
        })
    ], ProgramsFilterPipe);
    return ProgramsFilterPipe;
}());



/***/ }),

/***/ "./src/app/reserve/reserve.module.ts":
/*!*******************************************!*\
  !*** ./src/app/reserve/reserve.module.ts ***!
  \*******************************************/
/*! exports provided: ReservePageModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReservePageModule", function() { return ReservePageModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var _reserve_page__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./reserve.page */ "./src/app/reserve/reserve.page.ts");
/* harmony import */ var _components_locations_locations_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/locations/locations.component */ "./src/app/reserve/components/locations/locations.component.ts");
/* harmony import */ var _components_programs_programs_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/programs/programs.component */ "./src/app/reserve/components/programs/programs.component.ts");
/* harmony import */ var _components_tvs_tvs_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/tvs/tvs.component */ "./src/app/reserve/components/tvs/tvs.component.ts");
/* harmony import */ var ngx_moment__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ngx-moment */ "./node_modules/ngx-moment/fesm5/ngx-moment.js");
/* harmony import */ var _components_confirmation_confirmation_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/confirmation/confirmation.component */ "./src/app/reserve/components/confirmation/confirmation.component.ts");
/* harmony import */ var _shared_shared_module__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../shared/shared.module */ "./src/app/shared/shared.module.ts");
/* harmony import */ var _pipes_programs_filter_pipe__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./pipes/programs-filter.pipe */ "./src/app/reserve/pipes/programs-filter.pipe.ts");
/* harmony import */ var _guards_reservation_guard__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../guards/reservation.guard */ "./src/app/guards/reservation.guard.ts");
/* harmony import */ var _components_programs_program_program_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./components/programs/program/program.component */ "./src/app/reserve/components/programs/program/program.component.ts");
/* harmony import */ var _pipes_locations_filter_pipe__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./pipes/locations-filter.pipe */ "./src/app/reserve/pipes/locations-filter.pipe.ts");
/* harmony import */ var _components_programs_info_info_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./components/programs/info/info.component */ "./src/app/reserve/components/programs/info/info.component.ts");
/* harmony import */ var _components_locations_location_location_component__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./components/locations/location/location.component */ "./src/app/reserve/components/locations/location/location.component.ts");
/* harmony import */ var _wallet_wallet_module__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ../wallet/wallet.module */ "./src/app/wallet/wallet.module.ts");
/* harmony import */ var _wallet_wallet_page__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ../wallet/wallet.page */ "./src/app/wallet/wallet.page.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




















var routes = [
    {
        path: '',
        component: _reserve_page__WEBPACK_IMPORTED_MODULE_5__["ReservePage"],
        children: [
            {
                path: 'locations',
                component: _components_locations_locations_component__WEBPACK_IMPORTED_MODULE_6__["LocationsComponent"],
            },
            {
                path: 'programs',
                component: _components_programs_programs_component__WEBPACK_IMPORTED_MODULE_7__["ProgramsComponent"],
                canActivate: [_guards_reservation_guard__WEBPACK_IMPORTED_MODULE_13__["ReservationGuard"]],
            },
            {
                path: 'tvs',
                component: _components_tvs_tvs_component__WEBPACK_IMPORTED_MODULE_8__["TvsComponent"],
                canActivate: [_guards_reservation_guard__WEBPACK_IMPORTED_MODULE_13__["ReservationGuard"]],
            },
            {
                path: 'confirmation',
                component: _components_confirmation_confirmation_component__WEBPACK_IMPORTED_MODULE_10__["ConfirmationComponent"],
                canActivate: [_guards_reservation_guard__WEBPACK_IMPORTED_MODULE_13__["ReservationGuard"]],
            },
            {
                path: '',
                redirectTo: 'locations',
                pathMatch: 'full',
            },
        ],
    },
];
var ReservePageModule = /** @class */ (function () {
    function ReservePageModule() {
    }
    ReservePageModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"])({
            imports: [
                _shared_shared_module__WEBPACK_IMPORTED_MODULE_11__["SharedModule"],
                _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormsModule"],
                _ionic_angular__WEBPACK_IMPORTED_MODULE_4__["IonicModule"],
                _wallet_wallet_module__WEBPACK_IMPORTED_MODULE_18__["WalletModule"],
                ngx_moment__WEBPACK_IMPORTED_MODULE_9__["MomentModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_3__["RouterModule"].forChild(routes),
            ],
            declarations: [
                _reserve_page__WEBPACK_IMPORTED_MODULE_5__["ReservePage"],
                _components_locations_locations_component__WEBPACK_IMPORTED_MODULE_6__["LocationsComponent"],
                _components_programs_programs_component__WEBPACK_IMPORTED_MODULE_7__["ProgramsComponent"],
                _components_programs_program_program_component__WEBPACK_IMPORTED_MODULE_14__["ProgramComponent"],
                _components_tvs_tvs_component__WEBPACK_IMPORTED_MODULE_8__["TvsComponent"],
                _components_confirmation_confirmation_component__WEBPACK_IMPORTED_MODULE_10__["ConfirmationComponent"],
                _pipes_programs_filter_pipe__WEBPACK_IMPORTED_MODULE_12__["ProgramsFilterPipe"],
                _pipes_locations_filter_pipe__WEBPACK_IMPORTED_MODULE_15__["LocationsFilterPipe"],
                _components_programs_info_info_component__WEBPACK_IMPORTED_MODULE_16__["InfoComponent"],
                _components_locations_location_location_component__WEBPACK_IMPORTED_MODULE_17__["LocationComponent"],
            ],
            entryComponents: [_components_programs_info_info_component__WEBPACK_IMPORTED_MODULE_16__["InfoComponent"], _wallet_wallet_page__WEBPACK_IMPORTED_MODULE_19__["WalletPage"]],
        })
    ], ReservePageModule);
    return ReservePageModule;
}());



/***/ }),

/***/ "./src/app/reserve/reserve.page.html":
/*!*******************************************!*\
  !*** ./src/app/reserve/reserve.page.html ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-header>\n  <ion-toolbar>\n    <ion-buttons slot=\"start\">\n      <ion-back-button class=\"show-back-button\" *ngIf=\"showBack() && !searchMode\" (click)=\"goBack()\"></ion-back-button>\n    </ion-buttons>\n    <ion-buttons *ngIf=\"!searchMode\" slot=\"end\" padding-end> <app-coins></app-coins> </ion-buttons>\n    <ion-title *ngIf=\"!searchMode\"> {{ title }} </ion-title>\n    <ion-searchbar\n      #searchbar\n      *ngIf=\"searchMode\"\n      (ionCancel)=\"closeSearch()\"\n      (ionChange)=\"onSearch($event)\"\n      showCancelButton\n      animated\n    ></ion-searchbar>\n  </ion-toolbar>\n</ion-header>\n<ion-content>\n  <ion-refresher slot=\"fixed\" (ionRefresh)=\"doRefresh($event)\" [pullMax]=\"300\" [disabled]=\"disableRefresher()\">\n    <ion-refresher-content pullingIcon=\"arrow-down\" pullingText=\"Pull to refresh\" refreshingSpinner=\"crescent\">\n    </ion-refresher-content>\n  </ion-refresher>\n  <ion-fab vertical=\"bottom\" horizontal=\"end\" slot=\"fixed\" *ngIf=\"isSearchablePage() && !searchMode\">\n    <ion-fab-button color=\"primary\" (click)=\"toggleSearch()\"> <ion-icon name=\"search\"></ion-icon> </ion-fab-button>\n  </ion-fab>\n  <ion-row class=\"breadcrumbs ion-text-center\" justify-content-center padding>\n    <span [class.active]=\"isStepActive('location')\" [class.complete]=\"isStepComplete('location')\">\n      <ion-icon *ngIf=\"!isStepComplete('location')\" name=\"radio-button-off\" color=\"medium\"></ion-icon> \n      <ion-icon *ngIf=\"isStepComplete('location')\" name=\"checkmark-circle\" color=\"success\"></ion-icon>\n      <span class=\"text\">Location</span>\n    </span>\n    <span [class.active]=\"isStepActive('channel')\" [class.complete]=\"isStepComplete('channel')\">\n      <ion-icon *ngIf=\"!isStepComplete('channel')\" name=\"radio-button-off\" color=\"medium\"></ion-icon> \n      <ion-icon *ngIf=\"isStepComplete('channel')\" name=\"checkmark-circle\" color=\"success\"></ion-icon>\n      <span class=\"text\">Channel</span>\n    </span>\n    <span [class.active]=\"isStepActive('tv')\" [class.complete]=\"isStepComplete('tv')\">\n      <ion-icon *ngIf=\"!isStepComplete('tv')\" name=\"radio-button-off\" color=\"medium\"></ion-icon> \n      <ion-icon *ngIf=\"isStepComplete('tv')\" name=\"checkmark-circle\" color=\"success\"></ion-icon>\n      <span class=\"text\">TV</span>\n    </span>\n    <span [class.active]=\"isStepActive('confirm')\" [class.complete]=\"isStepComplete('confirm')\">\n      <ion-icon *ngIf=\"!isStepComplete('confirm')\" name=\"radio-button-off\" color=\"medium\"></ion-icon> \n      <ion-icon *ngIf=\"isStepComplete('confirm')\" name=\"checkmark-circle\" color=\"success\"></ion-icon>\n      <span class=\"text\">Confirm</span>\n    </span>\n  </ion-row>\n  <router-outlet></router-outlet>\n</ion-content>\n"

/***/ }),

/***/ "./src/app/reserve/reserve.page.scss":
/*!*******************************************!*\
  !*** ./src/app/reserve/reserve.page.scss ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".breadcrumbs span {\n  margin-right: 5px; }\n  .breadcrumbs span:not(.active) {\n    opacity: .4; }\n  .breadcrumbs ion-icon {\n  margin-right: 2px; }\n  .breadcrumbs ion-icon, .breadcrumbs .text {\n  vertical-align: middle; }\n  ion-item {\n  --padding-start: 0;\n  --inner-padding-end: 0; }\n  ion-item ion-card {\n    width: 100%; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aW1naWJsaW4vQ29kZS9jbGlja2VyL21vYmlsZS9hcHAvc3JjL2FwcC9yZXNlcnZlL3Jlc2VydmUucGFnZS5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBR0ksaUJBQWlCLEVBQUE7RUFIckI7SUFLTSxXQUFXLEVBQUE7RUFMakI7RUFTSSxpQkFBaUIsRUFBQTtFQVRyQjtFQVlJLHNCQUFzQixFQUFBO0VBSTFCO0VBQ0Usa0JBQWdCO0VBQ2hCLHNCQUFvQixFQUFBO0VBRnRCO0lBS0ksV0FBVyxFQUFBIiwiZmlsZSI6InNyYy9hcHAvcmVzZXJ2ZS9yZXNlcnZlLnBhZ2Uuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5icmVhZGNydW1icyB7XG4gIC8vIHBhZGRpbmctdG9wOiAxMnB4O1xuICBzcGFuIHtcbiAgICBtYXJnaW4tcmlnaHQ6IDVweDtcbiAgICAmOm5vdCguYWN0aXZlKSB7XG4gICAgICBvcGFjaXR5OiAuNDtcbiAgICB9XG4gIH1cbiAgaW9uLWljb24ge1xuICAgIG1hcmdpbi1yaWdodDogMnB4O1xuICB9XG4gIGlvbi1pY29uLCAudGV4dCB7XG4gICAgdmVydGljYWwtYWxpZ246IG1pZGRsZTtcbiAgfVxufVxuXG5pb24taXRlbSB7XG4gIC0tcGFkZGluZy1zdGFydDogMDtcbiAgLS1pbm5lci1wYWRkaW5nLWVuZDogMDtcblxuICBpb24tY2FyZCB7XG4gICAgd2lkdGg6IDEwMCU7XG4gIH1cbn1cbiJdfQ== */"

/***/ }),

/***/ "./src/app/reserve/reserve.page.ts":
/*!*****************************************!*\
  !*** ./src/app/reserve/reserve.page.ts ***!
  \*****************************************/
/*! exports provided: ReservePage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReservePage", function() { return ReservePage; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var _reserve_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./reserve.service */ "./src/app/reserve/reserve.service.ts");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var _wallet_wallet_page__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../wallet/wallet.page */ "./src/app/wallet/wallet.page.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};






var ReservePage = /** @class */ (function () {
    function ReservePage(store, reserveService, navCtrl, router, events, modalController, walletPage) {
        var _this = this;
        this.store = store;
        this.reserveService = reserveService;
        this.navCtrl = navCtrl;
        this.router = router;
        this.events = events;
        this.modalController = modalController;
        this.walletPage = walletPage;
        this.reserveService.titleEmitted$.subscribe(function (title) {
            _this.title = title;
        });
        this.reserveService.closeSearchEmitted$.subscribe(function () {
            _this.closeSearch();
        });
        this.reserveService.showingLocationsEmitted$.subscribe(function () {
            _this.showingLocations = true;
        });
        this.tokenCount$ = this.walletPage.getCoinCount();
    }
    ReservePage.prototype.goBack = function () {
        this.navCtrl.back();
    };
    ReservePage.prototype.showBack = function () {
        return this.router.url != '/tabs/reserve/locations';
    };
    ReservePage.prototype.disableRefresher = function () {
        return this.router.url === '/tabs/reserve/confirmation';
    };
    ReservePage.prototype.onCoinsClick = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.modalController.create({
                                component: _wallet_wallet_page__WEBPACK_IMPORTED_MODULE_5__["WalletPage"],
                            })];
                    case 1:
                        _a.walletModal = _b.sent();
                        return [4 /*yield*/, this.walletModal.present()];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    ReservePage.prototype.isSearchablePage = function () {
        return this.router.url.includes('programs') || (this.router.url.includes('locations') && this.showingLocations);
    };
    ReservePage.prototype.isStepActive = function (stepName) {
        switch (stepName) {
            case "location":
                return this.router.url.includes('locations');
            case "channel":
                return this.router.url.includes('programs');
            case "tv":
                return this.router.url.includes('tvs');
            case "confirm":
                return this.router.url.includes('confirmation');
        }
    };
    ReservePage.prototype.isStepComplete = function (stepName) {
        switch (stepName) {
            case "location":
                return !this.router.url.includes('locations');
            case "channel":
                return !this.router.url.includes('locations') && !this.router.url.includes('programs');
            case "tv":
                return !this.router.url.includes('locations') && !this.router.url.includes('programs') && !this.router.url.includes('tvs');
            case "confirm":
                return false;
        }
    };
    ReservePage.prototype.toggleSearch = function () {
        var _this = this;
        this.searchMode = !this.searchMode;
        setTimeout(function () { return _this.searchbar.setFocus(); }, 100);
    };
    ReservePage.prototype.closeSearch = function () {
        this.searchMode = false;
    };
    ReservePage.prototype.onSearch = function (e) {
        this.reserveService.emitSearch(e.detail.value);
    };
    ReservePage.prototype.doRefresh = function (event) {
        this.reserveService.emitRefresh();
        this.reserveService.refreshedEmitted$.pipe().subscribe(function () {
            event.target.complete();
        });
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewChild"])('searchbar'),
        __metadata("design:type", _ionic_angular__WEBPACK_IMPORTED_MODULE_1__["IonSearchbar"])
    ], ReservePage.prototype, "searchbar", void 0);
    ReservePage = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-reserve',
            template: __webpack_require__(/*! ./reserve.page.html */ "./src/app/reserve/reserve.page.html"),
            encapsulation: _angular_core__WEBPACK_IMPORTED_MODULE_0__["ViewEncapsulation"].None,
            styles: [__webpack_require__(/*! ./reserve.page.scss */ "./src/app/reserve/reserve.page.scss")]
        }),
        __metadata("design:paramtypes", [_ngrx_store__WEBPACK_IMPORTED_MODULE_4__["Store"],
            _reserve_service__WEBPACK_IMPORTED_MODULE_2__["ReserveService"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_1__["NavController"],
            _angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_1__["Events"],
            _ionic_angular__WEBPACK_IMPORTED_MODULE_1__["ModalController"],
            _wallet_wallet_page__WEBPACK_IMPORTED_MODULE_5__["WalletPage"]])
    ], ReservePage);
    return ReservePage;
}());



/***/ }),

/***/ "./src/app/reserve/reserve.service.ts":
/*!********************************************!*\
  !*** ./src/app/reserve/reserve.service.ts ***!
  \********************************************/
/*! exports provided: ReserveService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReserveService", function() { return ReserveService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


var ReserveService = /** @class */ (function () {
    function ReserveService() {
        this.emitTitleSource = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.titleEmitted$ = this.emitTitleSource.asObservable();
        this.emitSearchTermSource = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.searchTermEmitted$ = this.emitSearchTermSource.asObservable();
        this.emitCloseSearchSource = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.closeSearchEmitted$ = this.emitCloseSearchSource.asObservable();
        this.emitRefreshSource = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.refreshEmitted$ = this.emitRefreshSource.asObservable();
        this.emitRefreshedSource = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.refreshedEmitted$ = this.emitRefreshedSource.asObservable();
        this.emitShowingLocationsSource = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.showingLocationsEmitted$ = this.emitShowingLocationsSource.asObservable();
    }
    ReserveService.prototype.emitTitle = function (title) {
        this.emitTitleSource.next(title);
    };
    ReserveService.prototype.emitSearch = function (term) {
        this.emitSearchTermSource.next(term);
    };
    ReserveService.prototype.emitCloseSearch = function () {
        this.emitCloseSearchSource.next();
    };
    ReserveService.prototype.emitShowingLocations = function () {
        this.emitShowingLocationsSource.next();
    };
    ReserveService.prototype.emitRefresh = function () {
        this.emitRefreshSource.next();
        this.isRefreshing = true;
    };
    ReserveService.prototype.emitRefreshed = function () {
        this.emitRefreshedSource.next();
        this.isRefreshing = false;
    };
    ReserveService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({
            providedIn: 'root',
        })
    ], ReserveService);
    return ReserveService;
}());



/***/ }),

/***/ "./src/app/state/location/index.ts":
/*!*****************************************!*\
  !*** ./src/app/state/location/index.ts ***!
  \*****************************************/
/*! exports provided: getLocationsState, getAllLocations, getLoading, getError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLocationsState", function() { return getLocationsState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAllLocations", function() { return getAllLocations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLoading", function() { return getLoading; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getError", function() { return getError; });
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var _location_reducer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./location.reducer */ "./src/app/state/location/location.reducer.ts");


var getLocationsState = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createFeatureSelector"])('location');
var getAllLocations = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(getLocationsState, _location_reducer__WEBPACK_IMPORTED_MODULE_1__["getAllLocations"]);
var getLoading = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(getLocationsState, _location_reducer__WEBPACK_IMPORTED_MODULE_1__["getLoading"]);
var getError = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(getLocationsState, _location_reducer__WEBPACK_IMPORTED_MODULE_1__["getError"]);


/***/ }),

/***/ "./src/app/state/program/index.ts":
/*!****************************************!*\
  !*** ./src/app/state/program/index.ts ***!
  \****************************************/
/*! exports provided: getProgramsState, getAllPrograms, getLoading, getError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getProgramsState", function() { return getProgramsState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAllPrograms", function() { return getAllPrograms; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getLoading", function() { return getLoading; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getError", function() { return getError; });
/* harmony import */ var _ngrx_store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @ngrx/store */ "./node_modules/@ngrx/store/fesm5/store.js");
/* harmony import */ var _program_reducer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./program.reducer */ "./src/app/state/program/program.reducer.ts");


var getProgramsState = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createFeatureSelector"])('program');
var getAllPrograms = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(getProgramsState, _program_reducer__WEBPACK_IMPORTED_MODULE_1__["getAllPrograms"]);
var getLoading = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(getProgramsState, _program_reducer__WEBPACK_IMPORTED_MODULE_1__["getLoading"]);
var getError = Object(_ngrx_store__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(getProgramsState, _program_reducer__WEBPACK_IMPORTED_MODULE_1__["getError"]);


/***/ })

}]);
//# sourceMappingURL=reserve-reserve-module.js.map
<template>
  <or-modal
    :contain-focus="false"
    @close="clearData"
    @open="requestNumbers"
    class="buy-modal"
    title=""
    ref="modal"
  >
    <div class="buy-modal-left">
      <div class="map">
        <span class="map__state">Select state on the map: <span>{{selectedState.name}}</span></span>
        <states-map
          :selected-state.sync="selectedState"
          class="map__svg"
        ></states-map>

        <p>Your active numbers {{selectedState.name !== 'All' ? `in ${selectedState.name}` : ``}}</p>
        <ul :class="{ 'no-scroll': numbersFilteredByState.length < numbersAvailableToShow}" class="state-numbers scrollbar">
          <li
            v-for="number in numbersFilteredByState"

            :key="number.id"
          >
            {{number.value}} <span>{{number.state}}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="buy-modal-right">
      <div class="buy-modal-right__header">
        <p>Buy a numbers</p><p>in <b>{{selectedState.name === 'All' ? 'All states' : selectedState.name}}</b></p>
      </div>

      <or-alert
        v-if="!isAllowed"

        @dismiss="isAllowed = true"
        type="warning"
      >
        Only Admin has permissions to manage account numbers. Please contact your admin or OneReach Support.
      </or-alert>

      <div v-else>
        <div class="search-box">
          <or-textbox
            v-model="searchValue"

            class="search-filter"
            icon="search"
            name="searchInput"
            placeholder="Search by numbers"
          ></or-textbox>
          <ui-icon
            v-if="searchValue"

            @click.native="clearSearch"
            class="clear-search"
            icon="close"
          ></ui-icon>
        </div>

        <div class="numbers-container">
          <ui-progress-linear
            v-if="isLoading"

            color="primary"
            size="24"
          ></ui-progress-linear>
          <div v-else>
            <div
              v-show="hasItemsInBuyList"

              @click="changeBuyFilter"
              class="button"
            >{{buyfilterButtonText}}</div>
            <div class="numbers-list scrollbar">
              <div
                v-show="!filteredNumbers.length"

                class="ui-select__empty"
              >
                <p>No matching phone numbers</p>
              </div>
              <number-to-buy-item
                v-for="number in splitToPagesNumbers"

                :buyList="buyList"
                :key="number.phoneNumber"
                :number="number"
                transition="expand">
              </number-to-buy-item>
            </div>

            <div class="pagination">
              <or-button
                v-for="(list, key) in paginationButtons"

                :class="{selected: pageNumber  === key + 1}"
                :id="`${key + 1}button`"
                :key="key"
                @click="changePageNumber"
                color="deafult"
                type="secondary"
              >{{key + 1}}
              </or-button>
            </div>
          </div>
        </div>

        <div class="footer">
          <or-button
            :disabled="!hasItemsInBuyList || buyProgress"
            @click="buyNumbers"
            color="primary"
          >
            <span v-if="buyProgress">
              <ui-progress-circular
                v-show="buyProgress"

                color="white"
                size="18"
                type="indeterminate"
              ></ui-progress-circular>
            </span>
            <span v-else>
              Buy {{hasItemsInBuyList ? `(${buyList.length})` : null}}
            </span>
          </or-button>
          <!-- <div class="total">
            Total: USD {{totalPrice}} mothly
          </div> -->
        </div>
      </div>
    </div>

  </or-modal>
</template>

<script>
  import eventHub from '../eventHub.js';
  import {usCodes} from './mapData/usAreaCodes.js';

  import NumberToBuyItem from './numberToBuyItem.vue';
  import StatesMap from './statesMap.vue';

  export default {
    props: {
      numbers: {
        type: Array,
        default: []
      }
    },
    components: { NumberToBuyItem, StatesMap },

    created() {
      eventHub.$on('buyList:update', this.updateBuyList);
      eventHub.$on('update state', this.requestNumbers);
    },
    destroyed() {
      eventHub.$off('buyList:update', this.updateBuyList);
      eventHub.$off('update state', this.requestNumbers);
    },

    computed: {
      allFilteredNumbers() {
        return _.filter(this.numbersAvailableToBuy, n => this.availableBySearch(n));
      },
      buyfilterButtonText() {
        return `Show  ${
          this.hasItemsInBuyList && !this.showSelected
            ? `selected (${this.buyList.length})`
            : 'all'}`;
      },
      filteredNumbers() {
        return this.showSelected
          ? this.buyList
          : this.allFilteredNumbers
      },
      hasItemsInBuyList() {
        return this.buyList.length !== 0;
      },
      mappedNumbers() {
        return _
          .chain(_.cloneDeep(this.numbers))
          .filter(num => !num.isGroup)
          .reduce((arr, num) => {
            arr.push({id: num.id, value: num.phoneNumber, state: this.getState(num.phoneNumber)});
            return arr
          }, [])
          .value();
      },
      numbersFilteredByState() {
        if (this.selectedState.name === 'All') return this.mappedNumbers;

        return _.filter(this.mappedNumbers, num => num.state === this.selectedState.name)
      },
      paginationButtons() {
        let pagesLength = Math.ceil(this.filteredNumbers.length / this.numbersToShow);
        if (this.pageNumber > pagesLength) this.pageNumber = pagesLength || 1 ;

        return pagesLength;
      },
      splitToPagesNumbers() {
        return _.slice(this.filteredNumbers, (this.pageNumber - 1 ) * this.numbersToShow, this.pageNumber * this.numbersToShow);
      },
      totalPrice() {
        return _.reduce(this.buyList, (sum, x) => sum + x.price, 0);
      }
    },
    data() {
      return {
        buyList: [],
        buyProgress: false,
        isAllowed: true,
        isLoading: false,
        numbersAvailableToBuy: [],
        numbersAvailableToShow: 6,
        numbersToShow: 10,
        pageNumber: 1,
        searchValue: '',
        selectedState: {id: '', name: 'All'},
        showSelected: false
      }
    },
    methods: {
      availableBySearch(n) {
        const parts = n.phoneNumber.match(/\+?(\w+)/gi);
        const number = parts.shift();
        const query = _.toLower(this.searchValue);
        return number.indexOf(query) > -1
                || _.some(parts, a => _.toLower(a).indexOf(query) === 0)
                || _.toLower(parts.join(' ')).indexOf(query) === 0;
      },
      buyNumbers() {
        // todo: real buy
        this.buyProgress = true;
        this.$http.post(
          this.$flow.gatewayUrl('identifiers', this.$flow.providersAccountId()),
          {
            identifiers: this.buyList
          },
          {
            headers: {
              Authorization: `USER ${this.$settings.token}`
            }
          }
        )
        .then(() => {
          eventHub.$emit('update numbers data');
          this.buyList = [];
          this.buyProgress = false;
          this.$refs.modal.close();
        })
        .catch((e) => {
          if (e.status == '403') {
            this.isAllowed = false;
          }
          this.buyProgress = false;
        });
      },
      clearData() {
        eventHub.$emit('reset state', {...this.selectedState, id: this.selectedState.value});
        this.isAllowed = true;
        this.clearSearch();
      },
      clearSearch() {
        this.searchValue = '';
      },
      changeBuyFilter() {
        this.showSelected = !this.showSelected;
      },
      changePageNumber(event) {
        if (!event) return;

        this.pageNumber = _.parseInt(event.target.offsetParent.id)
      },
      getState(num) {
        if (_.startsWith(num, '+')) return usCodes[num.slice(2,5)].state;
        else {
          return 'State unrecognized';
        }
      },
      openModal() {
        this.$refs.modal.open();
      },
      requestNumbers(selectedState) {
        this.isLoading = true;
        this.pageNumber = 1;
        this.showSelected = false;

        this.$http.get(
          this.$flow.gatewayUrl('obtainable-identifiers', this.$flow.providersAccountId()),
          {
            headers: {
              Authorization: `USER ${this.$settings.token}`
            },
            params: {
              region: this.selectedState ? this.selectedState.value : ''
            }
          }
        )
        .then(response => response.json())
        .then(num => {
          this.numbersAvailableToBuy = this.selectedState.name === 'All' ?
            num.map(n => ({...n, region: this.getState(n.phoneNumber)})) :
            num.map(n => ({...n, region: ''}));
          this.isLoading = false;
        });
      },

      updateBuyList(newBuylist) {
        this.buyList = newBuylist;
      }
    },
    watch: {
      buyList() {
        if (!this.buyList.length) this.showSelected = false;
      }
    }
  }
</script>

<style lang="scss" scoped>
  .buy-modal .ui-modal__container {
    position: relative;

    width: 65rem;

    .ui-modal__header {
      position: absolute;
      top: 0;
      right: 0;
    }

    .ui-modal__body {
      display: flex;
      padding: 0;

      .buy-modal-left {
        flex-grow: 3;
        padding: 4% ;

        .map {
          &__state {
            display: block;
            padding-left: 14px;
            margin-bottom: 15px;

            color: #868B93;
            font-size: 16px;
            line-height: 21px;

            span {
              color: #0F232E;
            }
          }

          &__svg {
            margin-bottom: 6% ;
          }

          & > p {
            margin-bottom: 0;
            padding-left: 14px;
            padding-bottom: 14px;

            color: #0F232E;
            font-size: 22px;
            font-weight: 100;
            line-height: 26px;
          }

          .state-numbers {
            height: 150px;
            padding: 0 0 0 14px;
            margin: 0;

            list-style: none;
            overflow-y: scroll;

            li {
              margin-bottom: 10px;

              color: #0F232E;
              line-height: 21px;

              span {
                display: inline-block;
                margin-left: 20px;

                color: #868B93;
              }
            }

            &.no-scroll {
              overflow-y: visible;
            }
          }
        }
      }

      .buy-modal-right {
        position: relative;

        flex-grow: 2;
        padding: 40px 50px 20px;

        background-color: #F6F6F6;

        .button {
          padding: 0 10px;
          color: #0594ed;
          box-sizing: content-box;
          font-size: 12px;
          cursor: pointer;

          &.disabled {
            cursor:no-drop;
            color:#e7e7e7;
          }
        }

        &__header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 23px;
          margin-top: 15px;

          color: #0F232E;
          font-size: 14px;
          line-height: 26px;

          p {
            margin: 0;
          }

          p:first-child {
            font-size: 22px;
          }
        }

        .search-box {
          position: relative;

          margin-bottom: 30px;

          .clear-search {
            position: absolute;
            right: 5px;
            top: 17%;

            font-size: 20px;
            color: #a7aaaf;

            cursor: pointer;
            z-index: 10;
            background-color: #fff;
          }

          .ui-textbox {
            margin-bottom: 0;
            border: none;
          }

          .ui-textbox__icon-wrapper {
            position: absolute;
            top: 10px;
            left: inherit;
            right: 5px;

            margin: 0;
            padding-top: 0;

            .ui-icon {
              font-size: 21px;
              line-height: 14px;
              color: #91969D !important;
            }
          }

          .ui-textbox__input {
            padding: 7px 25px 10px 15px;

            font-size: 14px;

            border: none;
            background-color: white;
          }
        }

        .numbers-container {
          position: relative;
          padding-top: 22px;

          .button {
            position: absolute;
            top: 0;

            padding: 0;

            font-size: 14px;
            line-height: 21px;
          }

          .numbers-list {
            height: 350px;
            max-height: 350px;
            margin: 14px 0;

            .ui-select__empty p {
              text-align: center;
            }
          }

          .pagination {
            display: flex;
            justify-content: center;

            .ui-button {
              width: 32px;
              min-width: auto;
              height: 32px;
              padding: 16px;

              line-height: 0;

              border: none;
              border-radius: 50%;

              &.selected {
                .ui-button__content {
                  color: #64B2DA;
                }
              }

              &__content {
                color: #6D6D6D;
              }
            }
          }
        }
      }

      .footer {
        position: absolute;
        bottom: 35px;
        left: 0;
        right: 0;

        display: flex;
        justify-content: center;
      }

      .scrollbar {
        &::-webkit-scrollbar {
          width: 6px;
          background:#f6f6f6;
        }
        &::-webkit-scrollbar-track {
          -webkit-border-radius: 10px;
          border-radius: 10px;
        }
        &::-webkit-scrollbar-thumb {
          -webkit-border-radius: 4px;
          border-radius: 4;
          background:#d8d8d8;
        }
        &::-webkit-scrollbar-thumb:window-inactive {
          background: #d8d8d8;
        }
      }
    }
  }
</style>



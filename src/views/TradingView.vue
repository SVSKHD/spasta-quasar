<template>
  <div class="trading-view q-pa-md">
    <!-- Trading Dashboard Header -->
    <div class="row q-gutter-md q-mb-md">
      <div class="col-12">
        <q-card class="spasta-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h5 spasta-text">
                <q-icon name="trending_up" class="q-mr-sm icon-lg" />
                Trading Dashboard
              </div>
              <div class="row q-gutter-sm">
                <q-btn
                  flat
                  icon="refresh"
                  label="Refresh"
                  @click="refreshData"
                  class="spasta-text"
                  :loading="loading"
                />
                <q-btn
                  flat
                  icon="add"
                  label="Add Position"
                  @click="showPositionDialog = true"
                  class="spasta-text"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Trading Tabs -->
    <div class="row">
      <div class="col-12">
        <q-card class="spasta-card">
          <q-tabs
            v-model="activeTab"
            dense
            class="spasta-tabs"
            active-color="white"
            indicator-color="white"
            align="left"
          >
            <q-tab name="overview" icon="dashboard" label="Overview" class="spasta-text" />
            <q-tab name="positions" icon="list" label="Positions" class="spasta-text" />
            <q-tab name="watchlist" icon="visibility" label="Watchlist" class="spasta-text" />
            <q-tab name="orders" icon="receipt" label="Orders" class="spasta-text" />
            <q-tab name="analytics" icon="analytics" label="Analytics" class="spasta-text" />
            <q-tab name="news" icon="article" label="News" class="spasta-text" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated class="spasta-tab-panels">
            <!-- Overview Tab -->
            <q-tab-panel name="overview">
              <div class="overview-content">
                <!-- Portfolio Stats -->
                <div class="row q-gutter-md q-mb-lg">
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="account_balance_wallet" size="lg" color="white" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold spasta-text">${{ portfolioStats.totalValue.toLocaleString() }}</div>
                        <div class="text-body2 spasta-text opacity-70">Portfolio Value</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="trending_up" size="lg" :color="portfolioStats.totalPnL >= 0 ? 'positive' : 'negative'" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold" :class="portfolioStats.totalPnL >= 0 ? 'text-positive' : 'text-negative'">
                          ${{ portfolioStats.totalPnL.toLocaleString() }}
                        </div>
                        <div class="text-body2 spasta-text opacity-70">Total P&L</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="show_chart" size="lg" :color="portfolioStats.dailyPnL >= 0 ? 'positive' : 'negative'" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold" :class="portfolioStats.dailyPnL >= 0 ? 'text-positive' : 'text-negative'">
                          ${{ portfolioStats.dailyPnL.toLocaleString() }}
                        </div>
                        <div class="text-body2 spasta-text opacity-70">Daily P&L</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="pie_chart" size="lg" color="white" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold spasta-text">{{ positions.length }}</div>
                        <div class="text-body2 spasta-text opacity-70">Active Positions</div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="row q-gutter-md q-mb-lg">
                  <div class="col-12">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">Quick Actions</div>
                        <div class="row q-gutter-md">
                          <q-btn
                            color="positive"
                            icon="add"
                            label="Buy"
                            @click="quickAction('buy')"
                            class="col-auto"
                          />
                          <q-btn
                            color="negative"
                            icon="remove"
                            label="Sell"
                            @click="quickAction('sell')"
                            class="col-auto"
                          />
                          <q-btn
                            color="warning"
                            icon="schedule"
                            label="Set Alert"
                            @click="quickAction('alert')"
                            class="col-auto"
                          />
                          <q-btn
                            color="info"
                            icon="analytics"
                            label="Analyze"
                            @click="quickAction('analyze')"
                            class="col-auto"
                          />
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Recent Activity -->
                <div class="row">
                  <div class="col-12">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">Recent Activity</div>
                        <q-list>
                          <q-item v-for="activity in recentActivity" :key="activity.id" class="spasta-text">
                            <q-item-section avatar>
                              <q-icon :name="activity.icon" :color="activity.color" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ activity.title }}</q-item-label>
                              <q-item-label caption class="spasta-text opacity-70">{{ activity.description }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-item-label caption class="spasta-text opacity-70">{{ activity.time }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- Positions Tab -->
            <q-tab-panel name="positions">
              <div class="positions-content">
                <q-table
                  :rows="positions"
                  :columns="positionColumns"
                  row-key="id"
                  flat
                  dark
                  class="spasta-table"
                  :pagination="{ rowsPerPage: 10 }"
                >
                  <template v-slot:body-cell-symbol="props">
                    <q-td :props="props">
                      <div class="text-weight-medium spasta-text">{{ props.value }}</div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-type="props">
                    <q-td :props="props">
                      <q-chip
                        :color="props.value === 'LONG' ? 'positive' : 'negative'"
                        text-color="white"
                        size="sm"
                        :label="props.value"
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-pnl="props">
                    <q-td :props="props">
                      <div :class="props.value >= 0 ? 'text-positive' : 'text-negative'" class="text-weight-medium">
                        ${{ props.value.toLocaleString() }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props">
                      <q-btn
                        flat
                        round
                        dense
                        icon="edit"
                        size="sm"
                        @click="editPosition(props.row)"
                        class="spasta-text q-mr-xs"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="close"
                        size="sm"
                        @click="closePosition(props.row.id)"
                        class="text-negative"
                      />
                    </q-td>
                  </template>
                </q-table>
              </div>
            </q-tab-panel>

            <!-- Watchlist Tab -->
            <q-tab-panel name="watchlist">
              <div class="watchlist-content">
                <div class="row items-center justify-between q-mb-md">
                  <div class="text-h6 spasta-text">Watchlist</div>
                  <q-btn
                    flat
                    icon="add"
                    label="Add Symbol"
                    @click="showWatchlistDialog = true"
                    class="spasta-text"
                  />
                </div>

                <q-table
                  :rows="watchlist"
                  :columns="watchlistColumns"
                  row-key="symbol"
                  flat
                  dark
                  class="spasta-table"
                >
                  <template v-slot:body-cell-symbol="props">
                    <q-td :props="props">
                      <div class="text-weight-medium spasta-text">{{ props.value }}</div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-change="props">
                    <q-td :props="props">
                      <div :class="props.value >= 0 ? 'text-positive' : 'text-negative'" class="text-weight-medium">
                        {{ props.value >= 0 ? '+' : '' }}{{ props.value.toFixed(2) }}%
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props">
                      <q-btn
                        flat
                        round
                        dense
                        icon="add_shopping_cart"
                        size="sm"
                        @click="buyFromWatchlist(props.row)"
                        class="spasta-text q-mr-xs"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        size="sm"
                        @click="removeFromWatchlist(props.row.symbol)"
                        class="text-negative"
                      />
                    </q-td>
                  </template>
                </q-table>
              </div>
            </q-tab-panel>

            <!-- Orders Tab -->
            <q-tab-panel name="orders">
              <div class="orders-content">
                <div class="row items-center justify-between q-mb-md">
                  <div class="text-h6 spasta-text">Orders</div>
                  <q-btn
                    flat
                    icon="add"
                    label="New Order"
                    @click="showOrderDialog = true"
                    class="spasta-text"
                  />
                </div>

                <q-table
                  :rows="orders"
                  :columns="orderColumns"
                  row-key="id"
                  flat
                  dark
                  class="spasta-table"
                >
                  <template v-slot:body-cell-status="props">
                    <q-td :props="props">
                      <q-chip
                        :color="getOrderStatusColor(props.value)"
                        text-color="white"
                        size="sm"
                        :label="props.value"
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props">
                      <q-btn
                        v-if="props.row.status === 'PENDING'"
                        flat
                        round
                        dense
                        icon="cancel"
                        size="sm"
                        @click="cancelOrder(props.row.id)"
                        class="text-negative"
                      />
                    </q-td>
                  </template>
                </q-table>
              </div>
            </q-tab-panel>

            <!-- Analytics Tab -->
            <q-tab-panel name="analytics">
              <div class="analytics-content">
                <div class="row q-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">Performance Metrics</div>
                        <div class="metrics-list">
                          <div class="metric-item row items-center justify-between q-mb-sm">
                            <span class="spasta-text">Total Return:</span>
                            <span class="text-weight-bold" :class="portfolioStats.totalPnL >= 0 ? 'text-positive' : 'text-negative'">
                              {{ ((portfolioStats.totalPnL / 10000) * 100).toFixed(2) }}%
                            </span>
                          </div>
                          <div class="metric-item row items-center justify-between q-mb-sm">
                            <span class="spasta-text">Win Rate:</span>
                            <span class="text-weight-bold spasta-text">65.4%</span>
                          </div>
                          <div class="metric-item row items-center justify-between q-mb-sm">
                            <span class="spasta-text">Sharpe Ratio:</span>
                            <span class="text-weight-bold spasta-text">1.23</span>
                          </div>
                          <div class="metric-item row items-center justify-between q-mb-sm">
                            <span class="spasta-text">Max Drawdown:</span>
                            <span class="text-weight-bold text-negative">-8.5%</span>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">Risk Analysis</div>
                        <div class="risk-metrics">
                          <div class="risk-item q-mb-md">
                            <div class="text-body2 spasta-text q-mb-xs">Portfolio Beta</div>
                            <q-linear-progress
                              :value="0.85"
                              color="warning"
                              track-color="grey-3"
                              size="8px"
                              rounded
                            />
                            <div class="text-caption spasta-text q-mt-xs">0.85</div>
                          </div>
                          <div class="risk-item q-mb-md">
                            <div class="text-body2 spasta-text q-mb-xs">Volatility</div>
                            <q-linear-progress
                              :value="0.65"
                              color="negative"
                              track-color="grey-3"
                              size="8px"
                              rounded
                            />
                            <div class="text-caption spasta-text q-mt-xs">65%</div>
                          </div>
                          <div class="risk-item">
                            <div class="text-body2 spasta-text q-mb-xs">Diversification</div>
                            <q-linear-progress
                              :value="0.75"
                              color="positive"
                              track-color="grey-3"
                              size="8px"
                              rounded
                            />
                            <div class="text-caption spasta-text q-mt-xs">75%</div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- News Tab -->
            <q-tab-panel name="news">
              <div class="news-content">
                <div class="text-h6 spasta-text q-mb-md">Market News</div>
                <div class="row q-gutter-md">
                  <div v-for="article in marketNews" :key="article.id" class="col-12 col-md-6">
                    <q-card class="spasta-card news-card">
                      <q-card-section>
                        <div class="text-subtitle1 text-weight-medium spasta-text q-mb-sm">
                          {{ article.title }}
                        </div>
                        <div class="text-body2 spasta-text opacity-80 q-mb-sm">
                          {{ article.summary }}
                        </div>
                        <div class="row items-center justify-between">
                          <div class="text-caption spasta-text opacity-70">
                            {{ article.source }} • {{ article.time }}
                          </div>
                          <q-btn
                            flat
                            size="sm"
                            label="Read More"
                            @click="openNews(article.url)"
                            class="spasta-text"
                          />
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>

    <!-- Add/Edit Position Dialog -->
    <q-dialog v-model="showPositionDialog">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">{{ editingPosition ? 'Edit Position' : 'Add Position' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="savePosition" class="q-gutter-md">
            <q-input
              v-model="positionForm.symbol"
              label="Symbol"
              outlined
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-select
              v-model="positionForm.type"
              label="Type"
              outlined
              :options="['LONG', 'SHORT']"
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-model.number="positionForm.quantity"
              label="Quantity"
              outlined
              type="number"
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-model.number="positionForm.entryPrice"
              label="Entry Price"
              outlined
              type="number"
              step="0.01"
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-model.number="positionForm.currentPrice"
              label="Current Price"
              outlined
              type="number"
              step="0.01"
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closePositionDialog" class="spasta-text" />
          <q-btn 
            flat 
            label="Save" 
            color="white" 
            text-color="grey-8"
            @click="savePosition"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add to Watchlist Dialog -->
    <q-dialog v-model="showWatchlistDialog">
      <q-card class="spasta-card" style="min-width: 300px">
        <q-card-section>
          <div class="text-h6 spasta-text">Add to Watchlist</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="watchlistSymbol"
            label="Symbol"
            outlined
            dense
            autofocus
            class="spasta-input"
            color="white"
            label-color="white"
            dark
            @keyup.enter="addToWatchlist"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showWatchlistDialog = false" class="spasta-text" />
          <q-btn 
            flat 
            label="Add" 
            color="white" 
            text-color="grey-8"
            @click="addToWatchlist"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- New Order Dialog -->
    <q-dialog v-model="showOrderDialog">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">New Order</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form class="q-gutter-md">
            <q-input
              v-model="orderForm.symbol"
              label="Symbol"
              outlined
              dense
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <div class="row q-gutter-md">
              <div class="col">
                <q-select
                  v-model="orderForm.side"
                  label="Side"
                  outlined
                  dense
                  :options="['BUY', 'SELL']"
                  required
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
              <div class="col">
                <q-select
                  v-model="orderForm.type"
                  label="Order Type"
                  outlined
                  dense
                  :options="['MARKET', 'LIMIT', 'STOP']"
                  required
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                />
              </div>
            </div>

            <q-input
              v-model.number="orderForm.quantity"
              label="Quantity"
              outlined
              dense
              type="number"
              required
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />

            <q-input
              v-if="orderForm.type !== 'MARKET'"
              v-model.number="orderForm.price"
              label="Price"
              outlined
              dense
              type="number"
              step="0.01"
              class="spasta-input"
              color="white"
              label-color="white"
              dark
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showOrderDialog = false" class="spasta-text" />
          <q-btn 
            flat 
            label="Place Order" 
            color="white" 
            text-color="grey-8"
            @click="placeOrder"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

interface Position {
  id: string
  symbol: string
  type: 'LONG' | 'SHORT'
  quantity: number
  entryPrice: number
  currentPrice: number
  pnl: number
  createdAt: string
}

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  volume: number
}

interface Order {
  id: string
  symbol: string
  side: 'BUY' | 'SELL'
  type: 'MARKET' | 'LIMIT' | 'STOP'
  quantity: number
  price?: number
  status: 'PENDING' | 'FILLED' | 'CANCELLED'
  createdAt: string
}

interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  time: string
  url: string
}

const $q = useQuasar()
const activeTab = ref('overview')
const positions = ref<Position[]>([])
const watchlist = ref<WatchlistItem[]>([])
const orders = ref<Order[]>([])
const marketNews = ref<NewsArticle[]>([])
const showPositionDialog = ref(false)
const showWatchlistDialog = ref(false)
const showOrderDialog = ref(false)
const editingPosition = ref<Position | null>(null)
const loading = ref(false)
const watchlistSymbol = ref('')

const positionForm = ref({
  symbol: '',
  type: 'LONG' as 'LONG' | 'SHORT',
  quantity: 0,
  entryPrice: 0,
  currentPrice: 0
})

const orderForm = ref({
  symbol: '',
  side: 'BUY' as 'BUY' | 'SELL',
  type: 'MARKET' as 'MARKET' | 'LIMIT' | 'STOP',
  quantity: 0,
  price: 0
})

const recentActivity = ref([
  {
    id: '1',
    title: 'Bought 100 shares of AAPL',
    description: 'Market order executed at $155.50',
    time: '2 hours ago',
    icon: 'add_shopping_cart',
    color: 'positive'
  },
  {
    id: '2',
    title: 'Sold 50 shares of TSLA',
    description: 'Limit order filled at $785.00',
    time: '4 hours ago',
    icon: 'remove_shopping_cart',
    color: 'negative'
  },
  {
    id: '3',
    title: 'Price alert triggered',
    description: 'MSFT reached target price of $300',
    time: '1 day ago',
    icon: 'notifications',
    color: 'warning'
  }
])

const positionColumns = [
  { name: 'symbol', label: 'Symbol', field: 'symbol', align: 'left' },
  { name: 'type', label: 'Type', field: 'type', align: 'center' },
  { name: 'quantity', label: 'Quantity', field: 'quantity', align: 'right' },
  { name: 'entryPrice', label: 'Entry Price', field: 'entryPrice', align: 'right', format: (val: number) => `$${val.toFixed(2)}` },
  { name: 'currentPrice', label: 'Current Price', field: 'currentPrice', align: 'right', format: (val: number) => `$${val.toFixed(2)}` },
  { name: 'pnl', label: 'P&L', field: 'pnl', align: 'right' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const watchlistColumns = [
  { name: 'symbol', label: 'Symbol', field: 'symbol', align: 'left' },
  { name: 'name', label: 'Name', field: 'name', align: 'left' },
  { name: 'price', label: 'Price', field: 'price', align: 'right', format: (val: number) => `$${val.toFixed(2)}` },
  { name: 'change', label: 'Change %', field: 'change', align: 'right' },
  { name: 'volume', label: 'Volume', field: 'volume', align: 'right', format: (val: number) => val.toLocaleString() },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const orderColumns = [
  { name: 'symbol', label: 'Symbol', field: 'symbol', align: 'left' },
  { name: 'side', label: 'Side', field: 'side', align: 'center' },
  { name: 'type', label: 'Type', field: 'type', align: 'center' },
  { name: 'quantity', label: 'Quantity', field: 'quantity', align: 'right' },
  { name: 'price', label: 'Price', field: 'price', align: 'right', format: (val: number) => val ? `$${val.toFixed(2)}` : 'Market' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const portfolioStats = computed(() => {
  const totalValue = positions.value.reduce((sum, pos) => sum + (pos.quantity * pos.currentPrice), 0)
  const totalPnL = positions.value.reduce((sum, pos) => sum + pos.pnl, 0)
  const dailyPnL = totalPnL * 0.1 // Mock daily P&L calculation
  
  return {
    totalValue,
    totalPnL,
    dailyPnL
  }
})

const loadData = () => {
  // Load positions
  const storedPositions = localStorage.getItem('spasta_positions')
  if (storedPositions) {
    positions.value = JSON.parse(storedPositions)
  } else {
    // Add demo positions
    positions.value = [
      {
        id: '1',
        symbol: 'AAPL',
        type: 'LONG',
        quantity: 100,
        entryPrice: 150.00,
        currentPrice: 155.50,
        pnl: 550,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        symbol: 'TSLA',
        type: 'LONG',
        quantity: 50,
        entryPrice: 800.00,
        currentPrice: 785.00,
        pnl: -750,
        createdAt: new Date().toISOString()
      }
    ]
    savePositions()
  }

  // Load watchlist
  const storedWatchlist = localStorage.getItem('spasta_watchlist')
  if (storedWatchlist) {
    watchlist.value = JSON.parse(storedWatchlist)
  } else {
    watchlist.value = [
      { symbol: 'MSFT', name: 'Microsoft Corp', price: 299.50, change: 2.1, volume: 25000000 },
      { symbol: 'GOOGL', name: 'Alphabet Inc', price: 2750.00, change: -0.8, volume: 1200000 },
      { symbol: 'AMZN', name: 'Amazon.com Inc', price: 3200.00, change: 1.5, volume: 3500000 }
    ]
    saveWatchlist()
  }

  // Load orders
  const storedOrders = localStorage.getItem('spasta_orders')
  if (storedOrders) {
    orders.value = JSON.parse(storedOrders)
  } else {
    orders.value = [
      {
        id: '1',
        symbol: 'NVDA',
        side: 'BUY',
        type: 'LIMIT',
        quantity: 25,
        price: 450.00,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    ]
    saveOrders()
  }

  // Load market news
  marketNews.value = [
    {
      id: '1',
      title: 'Federal Reserve Signals Potential Rate Cut',
      summary: 'The Fed hints at possible interest rate adjustments in the coming quarter, impacting market sentiment.',
      source: 'Financial Times',
      time: '2 hours ago',
      url: '#'
    },
    {
      id: '2',
      title: 'Tech Stocks Rally on AI Breakthrough',
      summary: 'Major technology companies see significant gains following announcements of new AI capabilities.',
      source: 'Reuters',
      time: '4 hours ago',
      url: '#'
    },
    {
      id: '3',
      title: 'Energy Sector Outlook Remains Strong',
      summary: 'Analysts maintain positive outlook for energy stocks amid global supply chain improvements.',
      source: 'Bloomberg',
      time: '6 hours ago',
      url: '#'
    },
    {
      id: '4',
      title: 'Cryptocurrency Market Shows Volatility',
      summary: 'Digital assets experience mixed trading as regulatory clarity continues to evolve.',
      source: 'CoinDesk',
      time: '8 hours ago',
      url: '#'
    }
  ]
}

const savePositions = () => {
  localStorage.setItem('spasta_positions', JSON.stringify(positions.value))
}

const saveWatchlist = () => {
  localStorage.setItem('spasta_watchlist', JSON.stringify(watchlist.value))
}

const saveOrders = () => {
  localStorage.setItem('spasta_orders', JSON.stringify(orders.value))
}

const calculatePnL = (position: Omit<Position, 'pnl' | 'id' | 'createdAt'>) => {
  const { type, quantity, entryPrice, currentPrice } = position
  if (type === 'LONG') {
    return (currentPrice - entryPrice) * quantity
  } else {
    return (entryPrice - currentPrice) * quantity
  }
}

const quickAction = (action: string) => {
  switch (action) {
    case 'buy':
      orderForm.value.side = 'BUY'
      showOrderDialog.value = true
      break
    case 'sell':
      orderForm.value.side = 'SELL'
      showOrderDialog.value = true
      break
    case 'alert':
      $q.notify({
        type: 'info',
        message: 'Price alert feature coming soon',
        position: 'top-right',
        timeout: 2000
      })
      break
    case 'analyze':
      activeTab.value = 'analytics'
      break
  }
}

const savePosition = () => {
  const pnl = calculatePnL(positionForm.value)
  
  if (editingPosition.value) {
    // Update existing position
    const index = positions.value.findIndex(p => p.id === editingPosition.value!.id)
    if (index !== -1) {
      positions.value[index] = {
        ...editingPosition.value,
        ...positionForm.value,
        pnl
      }
    }
  } else {
    // Add new position
    const newPosition: Position = {
      id: Date.now().toString(),
      ...positionForm.value,
      pnl,
      createdAt: new Date().toISOString()
    }
    positions.value.push(newPosition)
  }
  
  savePositions()
  closePositionDialog()
  
  $q.notify({
    type: 'positive',
    message: editingPosition.value ? 'Position updated' : 'Position added',
    position: 'top-right',
    timeout: 2000
  })
}

const editPosition = (position: Position) => {
  editingPosition.value = position
  positionForm.value = {
    symbol: position.symbol,
    type: position.type,
    quantity: position.quantity,
    entryPrice: position.entryPrice,
    currentPrice: position.currentPrice
  }
  showPositionDialog.value = true
}

const closePosition = (positionId: string) => {
  $q.dialog({
    title: 'Close Position',
    message: 'Are you sure you want to close this position?',
    cancel: true,
    persistent: true,
    class: 'spasta-card'
  }).onOk(() => {
    const index = positions.value.findIndex(p => p.id === positionId)
    if (index !== -1) {
      positions.value.splice(index, 1)
      savePositions()
      
      $q.notify({
        type: 'positive',
        message: 'Position closed',
        position: 'top-right',
        timeout: 2000
      })
    }
  })
}

const closePositionDialog = () => {
  showPositionDialog.value = false
  editingPosition.value = null
  positionForm.value = {
    symbol: '',
    type: 'LONG',
    quantity: 0,
    entryPrice: 0,
    currentPrice: 0
  }
}

const addToWatchlist = () => {
  if (watchlistSymbol.value.trim()) {
    const newItem: WatchlistItem = {
      symbol: watchlistSymbol.value.toUpperCase(),
      name: `${watchlistSymbol.value.toUpperCase()} Corp`,
      price: Math.random() * 1000 + 50,
      change: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 50000000)
    }
    
    watchlist.value.push(newItem)
    saveWatchlist()
    watchlistSymbol.value = ''
    showWatchlistDialog.value = false
    
    $q.notify({
      type: 'positive',
      message: `${newItem.symbol} added to watchlist`,
      position: 'top-right',
      timeout: 2000
    })
  }
}

const removeFromWatchlist = (symbol: string) => {
  const index = watchlist.value.findIndex(item => item.symbol === symbol)
  if (index !== -1) {
    watchlist.value.splice(index, 1)
    saveWatchlist()
    
    $q.notify({
      type: 'positive',
      message: `${symbol} removed from watchlist`,
      position: 'top-right',
      timeout: 2000
    })
  }
}

const buyFromWatchlist = (item: WatchlistItem) => {
  orderForm.value.symbol = item.symbol
  orderForm.value.side = 'BUY'
  orderForm.value.type = 'MARKET'
  showOrderDialog.value = true
}

const placeOrder = () => {
  const newOrder: Order = {
    id: Date.now().toString(),
    symbol: orderForm.value.symbol,
    side: orderForm.value.side,
    type: orderForm.value.type,
    quantity: orderForm.value.quantity,
    price: orderForm.value.type !== 'MARKET' ? orderForm.value.price : undefined,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  }
  
  orders.value.push(newOrder)
  saveOrders()
  showOrderDialog.value = false
  
  // Reset form
  orderForm.value = {
    symbol: '',
    side: 'BUY',
    type: 'MARKET',
    quantity: 0,
    price: 0
  }
  
  $q.notify({
    type: 'positive',
    message: 'Order placed successfully',
    position: 'top-right',
    timeout: 2000
  })
}

const cancelOrder = (orderId: string) => {
  const index = orders.value.findIndex(order => order.id === orderId)
  if (index !== -1) {
    orders.value[index].status = 'CANCELLED'
    saveOrders()
    
    $q.notify({
      type: 'info',
      message: 'Order cancelled',
      position: 'top-right',
      timeout: 2000
    })
  }
}

const getOrderStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'warning'
    case 'FILLED': return 'positive'
    case 'CANCELLED': return 'negative'
    default: return 'grey'
  }
}

const openNews = (url: string) => {
  $q.notify({
    type: 'info',
    message: 'News article feature coming soon',
    position: 'top-right',
    timeout: 2000
  })
}

const refreshData = () => {
  loading.value = true
  // Simulate API call
  setTimeout(() => {
    // Update current prices with random fluctuations
    positions.value.forEach(position => {
      const change = (Math.random() - 0.5) * 10 // Random change between -5 and +5
      position.currentPrice = Math.max(0.01, position.currentPrice + change)
      position.pnl = calculatePnL(position)
    })
    
    // Update watchlist prices
    watchlist.value.forEach(item => {
      const change = (Math.random() - 0.5) * 20
      item.price = Math.max(0.01, item.price + change)
      item.change = (Math.random() - 0.5) * 10
    })
    
    savePositions()
    saveWatchlist()
    loading.value = false
    
    $q.notify({
      type: 'info',
      message: 'Data refreshed',
      position: 'top-right',
      timeout: 1500
    })
  }, 1000)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.trading-view {
  height: calc(100vh - 50px);
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(114, 92, 173, 0.3);
}

.spasta-tabs {
  background-color: rgba(114, 92, 173, 0.3);
}

.spasta-tabs :deep(.q-tab) {
  color: #FFE3A9;
}

.spasta-tabs :deep(.q-tab--active) {
  background-color: rgba(255, 227, 169, 0.2);
}

.spasta-tab-panels {
  background-color: transparent;
  min-height: 500px;
}

.spasta-table :deep(.q-table__top) {
  background: transparent;
}

.spasta-table :deep(.q-table thead th) {
  background: rgba(114, 92, 173, 0.3);
  color: #FFE3A9;
  font-weight: 600;
}

.spasta-table :deep(.q-table tbody td) {
  color: #FFE3A9;
}

.spasta-table :deep(.q-table tbody tr:hover) {
  background: rgba(114, 92, 173, 0.2);
}

.news-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.news-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(114, 92, 173, 0.3);
}

.metric-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 227, 169, 0.1);
}

.risk-item {
  padding: 8px 0;
}

.spasta-input :deep(.q-field__control) {
  background-color: rgba(255, 227, 169, 0.1);
  border-color: rgba(255, 227, 169, 0.3);
}

.spasta-input :deep(.q-field__native) {
  color: #FFE3A9;
}

.spasta-input :deep(.q-field__label) {
  color: #FFE3A9;
}

/* Tab content spacing */
.overview-content,
.positions-content,
.watchlist-content,
.orders-content,
.analytics-content,
.news-content {
  padding: 20px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .spasta-tabs {
    font-size: 12px;
  }
  
  .spasta-tabs :deep(.q-tab) {
    min-width: auto;
    padding: 8px 12px;
  }
  
  .overview-content,
  .positions-content,
  .watchlist-content,
  .orders-content,
  .analytics-content,
  .news-content {
    padding: 12px;
  }
}
</style>
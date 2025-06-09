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
            <q-tab name="forex" icon="currency_exchange" label="Forex" class="spasta-text" />
            <q-tab name="fyers" icon="account_balance" label="Fyers" class="spasta-text" />
            <q-tab name="watchlist" icon="visibility" label="Watchlist" class="spasta-text" />
            <q-tab name="orders" icon="receipt" label="Orders" class="spasta-text" />
            <q-tab name="analytics" icon="analytics" label="Analytics" class="spasta-text" />
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
                <SpastaTable
                  :rows="positions"
                  :columns="positionColumns"
                  row-key="id"
                  :pagination="{ rowsPerPage: 10 }"
                  @action="handlePositionAction"
                />
              </div>
            </q-tab-panel>

            <!-- Forex Tab -->
            <q-tab-panel name="forex">
              <div class="forex-content">
                <!-- Forex Stats -->
                <div class="row q-gutter-md q-mb-lg">
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="currency_exchange" size="lg" color="primary" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold spasta-text">{{ forexPairs.length }}</div>
                        <div class="text-body2 spasta-text opacity-70">Currency Pairs</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="trending_up" size="lg" color="positive" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold text-positive">${{ forexStats.totalPnL.toLocaleString() }}</div>
                        <div class="text-body2 spasta-text opacity-70">Forex P&L</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="account_balance" size="lg" color="info" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold text-info">${{ forexStats.totalVolume.toLocaleString() }}</div>
                        <div class="text-body2 spasta-text opacity-70">Total Volume</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="speed" size="lg" color="warning" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold text-warning">{{ forexStats.spread.toFixed(2) }}</div>
                        <div class="text-body2 spasta-text opacity-70">Avg Spread</div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Major Currency Pairs -->
                <div class="row q-gutter-md q-mb-lg">
                  <div class="col-12">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">Major Currency Pairs</div>
                        <SpastaTable
                          :rows="forexPairs"
                          :columns="forexColumns"
                          row-key="pair"
                          :pagination="{ rowsPerPage: 15 }"
                          @action="handleForexAction"
                        />
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Forex News -->
                <div class="row">
                  <div class="col-12">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">Forex News & Events</div>
                        <q-list>
                          <q-item v-for="news in forexNews" :key="news.id" class="spasta-text">
                            <q-item-section avatar>
                              <q-icon :name="news.impact === 'high' ? 'warning' : news.impact === 'medium' ? 'info' : 'help'" 
                                      :color="news.impact === 'high' ? 'negative' : news.impact === 'medium' ? 'warning' : 'grey'" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ news.title }}</q-item-label>
                              <q-item-label caption class="spasta-text opacity-70">{{ news.currency }} • {{ news.time }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-chip 
                                :color="news.impact === 'high' ? 'negative' : news.impact === 'medium' ? 'warning' : 'grey'"
                                text-color="white"
                                size="sm"
                                :label="news.impact"
                              />
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- Fyers Tab -->
            <q-tab-panel name="fyers">
              <div class="fyers-content">
                <!-- Fyers Connection Status -->
                <div class="row q-gutter-md q-mb-lg">
                  <div class="col-12">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="row items-center justify-between">
                          <div class="text-h6 spasta-text">
                            <q-icon name="account_balance" class="q-mr-sm" />
                            Fyers Integration
                          </div>
                          <q-chip 
                            :color="fyersConnection.connected ? 'positive' : 'negative'"
                            text-color="white"
                            :label="fyersConnection.connected ? 'Connected' : 'Disconnected'"
                          />
                        </div>
                        <div v-if="!fyersConnection.connected" class="q-mt-md">
                          <q-btn
                            color="primary"
                            icon="link"
                            label="Connect to Fyers"
                            @click="connectToFyers"
                            class="q-mr-sm"
                          />
                          <div class="text-caption spasta-text opacity-70 q-mt-sm">
                            Connect your Fyers account to access live trading data and place orders
                          </div>
                        </div>
                        <div v-else class="q-mt-md">
                          <div class="text-body2 spasta-text">
                            Account: {{ fyersConnection.accountId }} • 
                            Last Updated: {{ fyersConnection.lastUpdate }}
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Fyers Portfolio -->
                <div v-if="fyersConnection.connected" class="row q-gutter-md q-mb-lg">
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="account_balance_wallet" size="lg" color="primary" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold spasta-text">${{ fyersPortfolio.totalValue.toLocaleString() }}</div>
                        <div class="text-body2 spasta-text opacity-70">Portfolio Value</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="trending_up" size="lg" :color="fyersPortfolio.dayPnL >= 0 ? 'positive' : 'negative'" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold" :class="fyersPortfolio.dayPnL >= 0 ? 'text-positive' : 'text-negative'">
                          ${{ fyersPortfolio.dayPnL.toLocaleString() }}
                        </div>
                        <div class="text-body2 spasta-text opacity-70">Day P&L</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="account_balance" size="lg" color="info" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold text-info">${{ fyersPortfolio.availableMargin.toLocaleString() }}</div>
                        <div class="text-body2 spasta-text opacity-70">Available Margin</div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-sm-6 col-md-3">
                    <q-card class="spasta-card stat-card">
                      <q-card-section class="text-center">
                        <q-icon name="list" size="lg" color="warning" class="q-mb-sm" />
                        <div class="text-h4 text-weight-bold text-warning">{{ fyersHoldings.length }}</div>
                        <div class="text-body2 spasta-text opacity-70">Holdings</div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Fyers Holdings -->
                <div v-if="fyersConnection.connected" class="row q-gutter-md">
                  <div class="col-12">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">Fyers Holdings</div>
                        <SpastaTable
                          :rows="fyersHoldings"
                          :columns="fyersColumns"
                          row-key="symbol"
                          :pagination="{ rowsPerPage: 15 }"
                          @action="handleFyersAction"
                        />
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Connection Instructions -->
                <div v-else class="row">
                  <div class="col-12">
                    <q-card class="spasta-card">
                      <q-card-section>
                        <div class="text-h6 spasta-text q-mb-md">How to Connect Fyers</div>
                        <div class="connection-steps">
                          <div class="step-item q-mb-md">
                            <q-icon name="looks_one" color="primary" size="md" class="q-mr-md" />
                            <div>
                              <div class="text-body1 spasta-text text-weight-medium">Create Fyers Account</div>
                              <div class="text-body2 spasta-text opacity-70">Sign up for a Fyers trading account if you don't have one</div>
                            </div>
                          </div>
                          <div class="step-item q-mb-md">
                            <q-icon name="looks_two" color="primary" size="md" class="q-mr-md" />
                            <div>
                              <div class="text-body1 spasta-text text-weight-medium">Generate API Credentials</div>
                              <div class="text-body2 spasta-text opacity-70">Create API credentials in your Fyers dashboard</div>
                            </div>
                          </div>
                          <div class="step-item">
                            <q-icon name="looks_3" color="primary" size="md" class="q-mr-md" />
                            <div>
                              <div class="text-body1 spasta-text text-weight-medium">Connect Account</div>
                              <div class="text-body2 spasta-text opacity-70">Use the connect button to link your Fyers account</div>
                            </div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
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

                <SpastaTable
                  :rows="watchlist"
                  :columns="watchlistColumns"
                  row-key="symbol"
                  @action="handleWatchlistAction"
                />
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

                <SpastaTable
                  :rows="orders"
                  :columns="orderColumns"
                  row-key="id"
                  @action="handleOrderAction"
                />
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

interface ForexPair {
  pair: string
  bid: number
  ask: number
  spread: number
  change: number
  volume: number
}

interface ForexNews {
  id: string
  title: string
  currency: string
  impact: 'low' | 'medium' | 'high'
  time: string
}

interface FyersHolding {
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
}

const $q = useQuasar()
const activeTab = ref('overview')
const positions = ref<Position[]>([])
const watchlist = ref<WatchlistItem[]>([])
const orders = ref<Order[]>([])
const forexPairs = ref<ForexPair[]>([])
const forexNews = ref<ForexNews[]>([])
const fyersHoldings = ref<FyersHolding[]>([])
const showPositionDialog = ref(false)
const showWatchlistDialog = ref(false)
const showOrderDialog = ref(false)
const editingPosition = ref<Position | null>(null)
const loading = ref(false)
const watchlistSymbol = ref('')

const fyersConnection = ref({
  connected: false,
  accountId: '',
  lastUpdate: ''
})

const fyersPortfolio = ref({
  totalValue: 0,
  dayPnL: 0,
  availableMargin: 0
})

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
  { 
    name: 'type', 
    label: 'Type', 
    field: 'type', 
    align: 'center',
    type: 'chip',
    chipColors: { 'LONG': 'positive', 'SHORT': 'negative' }
  },
  { name: 'quantity', label: 'Quantity', field: 'quantity', align: 'right' },
  { 
    name: 'entryPrice', 
    label: 'Entry Price', 
    field: 'entryPrice', 
    align: 'right',
    type: 'currency'
  },
  { 
    name: 'currentPrice', 
    label: 'Current Price', 
    field: 'currentPrice', 
    align: 'right',
    type: 'currency'
  },
  { 
    name: 'pnl', 
    label: 'P&L', 
    field: 'pnl', 
    align: 'right',
    type: 'currency'
  },
  { 
    name: 'actions', 
    label: 'Actions', 
    field: 'actions', 
    align: 'center',
    type: 'actions',
    actions: [
      { name: 'edit', icon: 'edit', color: 'white', tooltip: 'Edit Position' },
      { name: 'close', icon: 'close', color: 'negative', tooltip: 'Close Position' }
    ]
  }
]

const watchlistColumns = [
  { name: 'symbol', label: 'Symbol', field: 'symbol', align: 'left' },
  { name: 'name', label: 'Name', field: 'name', align: 'left' },
  { 
    name: 'price', 
    label: 'Price', 
    field: 'price', 
    align: 'right',
    type: 'currency'
  },
  { 
    name: 'change', 
    label: 'Change %', 
    field: 'change', 
    align: 'right',
    type: 'percentage'
  },
  { name: 'volume', label: 'Volume', field: 'volume', align: 'right', format: (val: number) => val.toLocaleString() },
  { 
    name: 'actions', 
    label: 'Actions', 
    field: 'actions', 
    align: 'center',
    type: 'actions',
    actions: [
      { name: 'buy', icon: 'add_shopping_cart', color: 'positive', tooltip: 'Buy' },
      { name: 'remove', icon: 'delete', color: 'negative', tooltip: 'Remove from Watchlist' }
    ]
  }
]

const orderColumns = [
  { name: 'symbol', label: 'Symbol', field: 'symbol', align: 'left' },
  { 
    name: 'side', 
    label: 'Side', 
    field: 'side', 
    align: 'center',
    type: 'chip',
    chipColors: { 'BUY': 'positive', 'SELL': 'negative' }
  },
  { name: 'type', label: 'Type', field: 'type', align: 'center' },
  { name: 'quantity', label: 'Quantity', field: 'quantity', align: 'right' },
  { 
    name: 'price', 
    label: 'Price', 
    field: 'price', 
    align: 'right',
    format: (val: number) => val ? `$${val.toFixed(2)}` : 'Market'
  },
  { 
    name: 'status', 
    label: 'Status', 
    field: 'status', 
    align: 'center',
    type: 'chip',
    chipColors: { 'PENDING': 'warning', 'FILLED': 'positive', 'CANCELLED': 'negative' }
  },
  { 
    name: 'actions', 
    label: 'Actions', 
    field: 'actions', 
    align: 'center',
    type: 'actions',
    actions: [
      { 
        name: 'cancel', 
        icon: 'cancel', 
        color: 'negative', 
        tooltip: 'Cancel Order',
        condition: (row: any) => row.status === 'PENDING'
      }
    ]
  }
]

const forexColumns = [
  { name: 'pair', label: 'Pair', field: 'pair', align: 'left' },
  { 
    name: 'bid', 
    label: 'Bid', 
    field: 'bid', 
    align: 'right',
    type: 'currency',
    format: (val: number) => {
      const numVal = parseFloat(val as any)
      return isNaN(numVal) ? 'N/A' : numVal.toFixed(5)
    }
  },
  { 
    name: 'ask', 
    label: 'Ask', 
    field: 'ask', 
    align: 'right',
    type: 'currency',
    format: (val: number) => {
      const numVal = parseFloat(val as any)
      return isNaN(numVal) ? 'N/A' : numVal.toFixed(5)
    }
  },
  { 
    name: 'spread', 
    label: 'Spread', 
    field: 'spread', 
    align: 'right',
    format: (val: number) => {
      const numVal = parseFloat(val as any)
      return isNaN(numVal) ? 'N/A' : numVal.toFixed(1)
    }
  },
  { 
    name: 'change', 
    label: 'Change %', 
    field: 'change', 
    align: 'right',
    type: 'percentage'
  },
  { name: 'volume', label: 'Volume', field: 'volume', align: 'right', format: (val: number) => val.toLocaleString() },
  { 
    name: 'actions', 
    label: 'Actions', 
    field: 'actions', 
    align: 'center',
    type: 'actions',
    actions: [
      { name: 'buy', icon: 'trending_up', color: 'positive', tooltip: 'Buy' },
      { name: 'sell', icon: 'trending_down', color: 'negative', tooltip: 'Sell' },
      { name: 'watch', icon: 'visibility', color: 'info', tooltip: 'Add to Watchlist' }
    ]
  }
]

const fyersColumns = [
  { name: 'symbol', label: 'Symbol', field: 'symbol', align: 'left' },
  { name: 'quantity', label: 'Quantity', field: 'quantity', align: 'right' },
  { 
    name: 'avgPrice', 
    label: 'Avg Price', 
    field: 'avgPrice', 
    align: 'right',
    type: 'currency'
  },
  { 
    name: 'currentPrice', 
    label: 'Current Price', 
    field: 'currentPrice', 
    align: 'right',
    type: 'currency'
  },
  { 
    name: 'pnl', 
    label: 'P&L', 
    field: 'pnl', 
    align: 'right',
    type: 'currency'
  },
  { 
    name: 'pnlPercent', 
    label: 'P&L %', 
    field: 'pnlPercent', 
    align: 'right',
    type: 'percentage'
  },
  { 
    name: 'actions', 
    label: 'Actions', 
    field: 'actions', 
    align: 'center',
    type: 'actions',
    actions: [
      { name: 'sell', icon: 'trending_down', color: 'negative', tooltip: 'Sell' },
      { name: 'details', icon: 'info', color: 'info', tooltip: 'View Details' }
    ]
  }
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

const forexStats = computed(() => {
  const totalPnL = 2450
  const totalVolume = 125000
  const spread = forexPairs.value.reduce((sum, pair) => sum + pair.spread, 0) / forexPairs.value.length || 0
  
  return {
    totalPnL,
    totalVolume,
    spread
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

  // Load forex data
  forexPairs.value = [
    { pair: 'EUR/USD', bid: 1.0845, ask: 1.0847, spread: 0.2, change: 0.15, volume: 2500000 },
    { pair: 'GBP/USD', bid: 1.2634, ask: 1.2636, spread: 0.2, change: -0.23, volume: 1800000 },
    { pair: 'USD/JPY', bid: 149.85, ask: 149.87, spread: 0.2, change: 0.45, volume: 2200000 },
    { pair: 'USD/CHF', bid: 0.8756, ask: 0.8758, spread: 0.2, change: -0.12, volume: 1200000 },
    { pair: 'AUD/USD', bid: 0.6523, ask: 0.6525, spread: 0.2, change: 0.34, volume: 950000 }
  ]

  forexNews.value = [
    {
      id: '1',
      title: 'ECB Interest Rate Decision',
      currency: 'EUR',
      impact: 'high',
      time: '2:00 PM EST'
    },
    {
      id: '2',
      title: 'US Non-Farm Payrolls',
      currency: 'USD',
      impact: 'high',
      time: '8:30 AM EST'
    },
    {
      id: '3',
      title: 'UK GDP Growth Rate',
      currency: 'GBP',
      impact: 'medium',
      time: '4:30 AM EST'
    }
  ]

  // Load Fyers data (demo)
  fyersHoldings.value = [
    {
      symbol: 'RELIANCE',
      quantity: 50,
      avgPrice: 2450.00,
      currentPrice: 2520.00,
      pnl: 3500,
      pnlPercent: 2.86
    },
    {
      symbol: 'TCS',
      quantity: 25,
      avgPrice: 3200.00,
      currentPrice: 3150.00,
      pnl: -1250,
      pnlPercent: -1.56
    }
  ]

  fyersPortfolio.value = {
    totalValue: 185000,
    dayPnL: 2250,
    availableMargin: 45000
  }
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

const handlePositionAction = (action: string, row: Position) => {
  switch (action) {
    case 'edit':
      editPosition(row)
      break
    case 'close':
      closePosition(row.id)
      break
  }
}

const handleWatchlistAction = (action: string, row: WatchlistItem) => {
  switch (action) {
    case 'buy':
      buyFromWatchlist(row)
      break
    case 'remove':
      removeFromWatchlist(row.symbol)
      break
  }
}

const handleOrderAction = (action: string, row: Order) => {
  switch (action) {
    case 'cancel':
      cancelOrder(row.id)
      break
  }
}

const handleForexAction = (action: string, row: ForexPair) => {
  switch (action) {
    case 'buy':
    case 'sell':
      $q.notify({
        type: 'info',
        message: `${action.toUpperCase()} ${row.pair} - Feature coming soon`,
        position: 'top-right',
        timeout: 2000
      })
      break
    case 'watch':
      $q.notify({
        type: 'positive',
        message: `${row.pair} added to watchlist`,
        position: 'top-right',
        timeout: 2000
      })
      break
  }
}

const handleFyersAction = (action: string, row: FyersHolding) => {
  switch (action) {
    case 'sell':
      $q.notify({
        type: 'info',
        message: `Sell ${row.symbol} - Feature coming soon`,
        position: 'top-right',
        timeout: 2000
      })
      break
    case 'details':
      $q.notify({
        type: 'info',
        message: `View details for ${row.symbol}`,
        position: 'top-right',
        timeout: 2000
      })
      break
  }
}

const connectToFyers = () => {
  $q.notify({
    type: 'info',
    message: 'Fyers integration coming soon',
    position: 'top-right',
    timeout: 2000
  })
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
    
    // Update forex prices
    forexPairs.value.forEach(pair => {
      const change = (Math.random() - 0.5) * 0.01
      pair.bid = Math.max(0.01, pair.bid + change)
      pair.ask = pair.bid + (pair.spread / 10000)
      pair.change = (Math.random() - 0.5) * 2
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
  color: #EFE4D2;
}

.spasta-tabs :deep(.q-tab--active) {
  background-color: rgba(239, 228, 210, 0.2);
}

.spasta-tab-panels {
  background-color: transparent;
  min-height: 500px;
}

.metric-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
}

.risk-item {
  padding: 8px 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
}

.connection-steps {
  max-width: 600px;
}

/* Tab content spacing */
.overview-content,
.positions-content,
.forex-content,
.fyers-content,
.watchlist-content,
.orders-content,
.analytics-content {
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
  .forex-content,
  .fyers-content,
  .watchlist-content,
  .orders-content,
  .analytics-content {
    padding: 12px;
  }
  
  .step-item {
    flex-direction: column;
    text-align: center;
  }
  
  .step-item .q-icon {
    margin-bottom: 8px;
    margin-right: 0;
  }
}
</style>
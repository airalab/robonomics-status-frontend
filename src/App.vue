<template>
  <div id="app">
    <v-app id="inspire">
      <v-toolbar color="">
        <a href="/">
          <img src="static/assets/i/logo-robonomics-2.svg" height="38px" width="38px">
        </a>
        <v-toolbar-title>Robonomics status</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items class="hidden-sm-and-down">
          <v-btn flat to="/">Status</v-btn>
          <v-btn flat to="/graph">Graph</v-btn>
          <v-btn flat to="/msg">Msg</v-btn>
          <v-chip small color="primary">
            <a style="color:white;text-decoration: none;" href="https://github.com/airalab/robonomics_contracts/releases/tag/v0.12" target="_blank">
              ENS v{{version}}
            </a>
          </v-chip>
        </v-toolbar-items>
      </v-toolbar>
      <v-content>
        <v-container fluid grid-list-md :class="{ 'page': $route.path !== '/graph' }">
          <v-layout row wrap>
            <v-flex md12>
              <router-view />
            </v-flex>
          </v-layout>
        </v-container>
      </v-content>
    </v-app>
  </div>
</template>

<script>
import config from './config'

export default {
  name: 'App',
  data () {
    return {
      version: config.VERSION
    }
  }
}
</script>

<style>
  body {
    font-family: Roboto,Arial,Helvetica,sans-serif;
    font-size: 16px;
    line-height: 1.5;
    font-weight: 300;
    word-spacing: normal;
    letter-spacing: 0;
    color: #333;
    background-color: #f2f2f2;
  }
  .application.theme--light {
    background: #f2f2f2;
    color: rgba(0,0,0,.87);
  }
  .container.page, .v-toolbar__content {
    max-width: 1185px !important;
  }
  .v-toolbar__content {
    margin: auto;
  }
  .theme--light.v-toolbar {
    box-shadow: none;
    background-color: #f2f2f2;
  }
  .v-toolbar__content .v-btn__content {
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 1px;
    line-height: 1;
    color: #42475f;
  }
  .v-toolbar__content .v-btn--active:before, .v-toolbar__content .v-btn:focus:before, .v-toolbar__content .v-btn:hover:before {
    background-color: transparent;
    border-bottom: 1px solid #282b38;
  }
  h1, h2, h3, h4, h5, h6 {
    line-height: 1.5;
    text-transform: uppercase;
    letter-spacing: 1px;
    word-spacing: 2px;
  }
  h2 {
    font-weight: 300;
  }
  .application .theme--light.card, .theme--light .card {
    border: 1px solid #707070;
    border-radius: 0;
    box-shadow: none;
  }
  a {
    color: #03a5ed;
    text-decoration: underline;
  }
  a:hover {
    color: #27bbfc;
    text-decoration: none;
  }
  a.btn__text_orange:hover {
    color: #54ce63;
  }
  a.btn__text_orange {
    color: #f15a24;
  }
  a.btn__text_orange {
    display: inline-block;
    font-size: 20px;
    font-weight: 400;
    transition: .2s color ease-in;
  }
</style>

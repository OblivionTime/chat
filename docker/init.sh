#!/bin/bash
cp -rf /chat/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf
service mysql start
mysql < /chat/execSql.sql

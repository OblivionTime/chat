ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
flush privileges;
use mysql;
update user set Host="%" where User="root";
create database chat character set = utf8mb4;
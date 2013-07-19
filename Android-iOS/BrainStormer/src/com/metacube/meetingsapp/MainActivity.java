package com.metacube.meetingsapp;



import org.apache.cordova.DroidGap;

import com.metacube.meetingsapp.R;

import android.os.Bundle;
import android.view.Menu;

public class MainActivity extends DroidGap {
	
	public static MainActivity context;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        context = this;
        //setContentView(R.layout.activity_main);
        super.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_main, menu);
        return true;
    }
}
